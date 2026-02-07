import {
    BadRequestException,
    GatewayTimeoutException,
    Injectable,
    NotFoundException,
    ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { Repository } from 'typeorm';
import { LlmService } from 'src/common/llm/llm.service';
import { ANALYZE_PROMPT } from 'src/common/prompts/analyze.prompt';
import { AnalyzeNewsResponseDto, GetArticleResponseDto, SentenceDetailResponseDto } from './dtos/news.dto';
import { ArticleSentence as ArticleSentenceContent, GoalArticle } from './entities/goal-article.entity';
import { ArticleSentence, TermExplanation } from './entities/article-sentence.entity';
import { Goal } from '../auth/entities/goal.entity';
import { GoalLog, GoalLogStatus } from '../auth/entities/goal-log.entity';

@Injectable()
export class NewsService {
    constructor(
        @InjectRepository(News)
        private newsRepository: Repository<News>,
        private llmService: LlmService,
        @InjectRepository(GoalArticle)
        private goalArticleRepository: Repository<GoalArticle>,
        @InjectRepository(ArticleSentence)
        private articleSentenceRepository: Repository<ArticleSentence>,
        @InjectRepository(Goal)
        private goalRepository: Repository<Goal>,
        @InjectRepository(GoalLog)
        private goalLogRepository: Repository<GoalLog>,
    ) {}

    async create(title: string) {
        const news = this.newsRepository.create({ title });
        return this.newsRepository.save(news);
    }

    // 오늘의 GoalLog 가져오거나 생성
    private async getOrCreateTodayLog(userId: string): Promise<GoalLog> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. 오늘의 log가 이미 있는지 확인
        let log = await this.goalLogRepository.findOne({
            where: { 
                user_id: userId, 
                date: today 
            },
        });

        // 2. 없으면 새로 생성
        if (!log) {
            // 유저의 목표 설정 가져오기
            const goal = await this.goalRepository.findOne({
                where: { user_id: userId },
            });
            if (!goal) {
                throw new NotFoundException('목표 설정이 없습니다. 먼저 /auth/goals에서 목표를 설정해주세요.');
            }

            log = this.goalLogRepository.create({
                user_id: userId,
                date: today,
                target_count: goal.numbers,
                current_count: 0,
                status: GoalLogStatus.IN_PROGRESS,
            });

            log = await this.goalLogRepository.save(log);
            console.log(`[GoalLog 생성] user_id: ${userId}, date: ${today.toISOString().split('T')[0]}`);
        }

        return log;
    }

    async analyze(content: string): Promise<string> {
        return this.llmService.invoke(ANALYZE_PROMPT.SYSTEM, content);
    }

    async analyzeFromUrl(userId: string, article_url: string): Promise<AnalyzeNewsResponseDto> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. GoalLog 가져오거나 생성
        const goalLog = await this.getOrCreateTodayLog(userId);

        // 2. URL에서 HTML 가져오기
        const html = await this.fetchHtml(article_url);

        // 3. LLM으로 HTML에서 뉴스 본문 추출 및 문장 분리
        const sentences = await this.llmService.invokeJson<ArticleSentenceContent[]>(
            ANALYZE_PROMPT.EXTRACT_NEWS,
            html,
        );

        // 4. 유효성 검사
        if (!sentences || sentences.length === 0) {
            throw new BadRequestException('뉴스 본문을 추출할 수 없습니다.');
        }

        // 5. 제목 추출 (id: 0)
        const titleSentence = sentences.find((s) => s.id === 0);
        const title = titleSentence?.p || '제목 없음';

        // 6. DB에 저장
        const goalArticle = this.goalArticleRepository.create({
            user_id: userId,
            log_id: goalLog.id,
            date: today,
            article_url,
            title,
            contents: sentences,
        });
        const savedArticle = await this.goalArticleRepository.save(goalArticle);

        // 7. GoalLog 상태 업데이트
        goalLog.current_count += 1;
        if (goalLog.current_count >= goalLog.target_count) {
            goalLog.status = GoalLogStatus.COMPLETED;
            console.log(`[목표 달성!] user_id: ${userId}, current: ${goalLog.current_count}/${goalLog.target_count}`);
        }
        await this.goalLogRepository.save(goalLog);

        // 8. 각 문장별로 용어 추출 및 저장
        const sentenceDetails = await this.extractTermsForSentences(savedArticle.id, sentences);

        // 9. 응답 반환
        return {
            articleId: savedArticle.id,
            title: savedArticle.title,
            contents: savedArticle.contents,
            explanations: sentenceDetails,
        };
    }

    async getSentenceDetail(
        articleId: number,
        sentenceId: number,
        generateDetail: boolean = false,
    ): Promise<SentenceDetailResponseDto> {
        // 1. DB에서 문장 조회
        const sentence = await this.articleSentenceRepository.findOne({
            where: {
                articlesId: articleId,
                sentenceId: sentenceId,
            }
        })

        if (!sentence) {
            throw new NotFoundException(
                `문장을 찾을 수 없습니다. (articleId: ${articleId}, sentenceId: ${sentenceId})`,
            );
        }

        // 2. detail=true이고, 상세 설명이 아직 없으면 생성
        const needsGeneration = this.hasNullDetailedExplain(sentence.explanations);
        if (generateDetail && needsGeneration) {
            console.log(`[상세 설명 생성 시작] articleId: ${articleId}, sentenceId: ${sentenceId}`);
            const startTime = Date.now();
            sentence.explanations = await this.generateDetailedExplanations(sentence.explanations);
            await this.articleSentenceRepository.save(sentence);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`[상세 설명 생성 완료] 소요 시간: ${elapsed}초`);
        }

        // 3. 응답 반환
        return {
            id: sentence.id,
            sentenceId: sentence.sentenceId,
            explanations: sentence.explanations,
            hasDetailedExplanations: !this.hasNullDetailedExplain(sentence.explanations),
        };
    }

    async getArticle(articleId: number): Promise<GetArticleResponseDto> {
        const article = await this.goalArticleRepository.findOne({
            where: { id: articleId },
        });

        if (!article) {
            throw new NotFoundException(`기사를 찾을 수 없습니다. (id: ${articleId})`);
        }
        
        return {
            id: article.id,
            title: article.title,
            article_url: article.article_url,
            status: article.status,
            contents: article.contents,
        };
    }
    
    // 상세 설명 생성
    private async generateDetailedExplanations(
        explanations: TermExplanation[],
    ): Promise<TermExplanation[]> {
        const updatedExplanations = await Promise.all(
            explanations.map(async (exp) => {
                // 이미 상세 설명이 있으면 스킵
                if (exp.detailed_explain !== null) {
                    return exp;
                }

                // LLM으로 상세 설명 생성
                try {
                    const prompt = ANALYZE_PROMPT.GENERATE_DETAILED_EXPLAIN
                        .replace('{keyword}', exp.keyword)
                        .replace('{explain}', exp.explain);
                    const detailedExplain = await this.llmService.invoke('', prompt);
                    return {
                        ...exp,
                        detailed_explain: detailedExplain.trim(),
                    };
                } catch (error) {
                    console.error(`상세 설명 생성 실패 (${exp.keyword}):`, error);
                    return exp; // 실패 시 원본 유지
                }
            }),
        );

        return updatedExplanations;
    }
    
    // detailed_explain이 null인 항목이 있는지 확인
    private hasNullDetailedExplain(explanations: TermExplanation[]): boolean {
        if (!explanations || explanations.length === 0) return false;
        return explanations.some((exp) => exp.detailed_explain === null);
    }

    // 문장별 용어 추출 및 저장
    private async extractTermsForSentences(
        articlesId: number,
        sentences: ArticleSentenceContent[],
    ): Promise<ArticleSentence[]> {
        const startTime = Date.now();
        console.log(`[용어 추출 시작] 문장 개수: ${sentences.length}개`);

        // Promise.all로 모든 문장을 동시에 처리
        const savedSentences = await Promise.all(
            sentences.map(async (sentence) => {
                // LLM으로 용어 추출
                let explanations: TermExplanation[] = [];
                try {
                    explanations = await this.llmService.invokeJson<TermExplanation[]>(
                        ANALYZE_PROMPT.EXTRACT_TERMS,
                        sentence.p
                    );
                } catch (error) {
                    console.error(`용어 추출 실패 (sentenceId: ${sentence.id}):`, error);
                    explanations = []
                }

                // ArticleSentence 저장
                const articleSentence = this.articleSentenceRepository.create({
                    articlesId,
                    sentenceId: sentence.id,
                    explanations,
                })

                return this.articleSentenceRepository.save(articleSentence)
            })
        )

        const endTime = Date.now();
        const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);
        console.log(`[용어 추출 완료] 소요 시간: ${elapsedTime}초`);

        return savedSentences;
    }

    // HTML 페이지 가져오기 (fetch 버전)
    private async fetchHtml(url: string): Promise<string> {
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url);
        } catch {
            throw new BadRequestException(`유효하지 않은 URL입니다: ${url}`);
        }

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            throw new BadRequestException('http/https URL만 허용됩니다.');
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);

        try {
            const response = await fetch(parsedUrl.toString(), {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; NewGenieBot/1.0)',
                    Accept: 'text/html,application/xhtml+xml',
                },
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new ServiceUnavailableException(
                    `URL을 가져올 수 없습니다 (status: ${response.status})`,
                );
            }

            const html = await response.text();
            if (!html.trim()) {
                throw new ServiceUnavailableException(
                    '가져온 HTML이 비어 있습니다.',
                );
            }

            return html;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new GatewayTimeoutException(
                    '요청 시간이 초과되었습니다 (10초).',
                );
            }

            if (
                error instanceof BadRequestException ||
                error instanceof ServiceUnavailableException
            ) {
                throw error;
            }

            throw new ServiceUnavailableException(
                'HTML 요청 중 네트워크 오류가 발생했습니다.',
            );
        } finally {
            clearTimeout(timeout);
        }
    }
}
