import {
    BadRequestException,
    GatewayTimeoutException,
    Injectable,
    ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { Repository } from 'typeorm';
import { LlmService } from 'src/common/llm/llm.service';
import { ANALYZE_PROMPT } from 'src/common/prompts/analyze.prompt';
import { AnalyzeNewsResponseDto } from './dtos/news.dto';
import { ArticleSentence as ArticleSentenceContent, GoalArticle } from './entities/goal-article.entity';
import { ArticleSentence, TermExplanation } from './entities/article-sentence.entity';

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
    ) {}

    async create(title: string) {
        const news = this.newsRepository.create({ title });
        return this.newsRepository.save(news);
    }

    async analyze(content: string): Promise<string> {
        return this.llmService.invoke(ANALYZE_PROMPT.SYSTEM, content);
    }

    async analyzeFromUrl(article_url: string): Promise<AnalyzeNewsResponseDto> {
        // 1. URL에서 HTML 가져오기
        const html = await this.fetchHtml(article_url);

        // 2. LLM으로 HTML에서 뉴스 본문 추출 및 문장 분리
        const sentences = await this.llmService.invokeJson<ArticleSentenceContent[]>(
            ANALYZE_PROMPT.EXTRACT_NEWS,
            html,
        );

        // 3. 유효성 검사
        if (!sentences || sentences.length === 0) {
            throw new BadRequestException('뉴스 본문을 추출할 수 없습니다.');
        }

        // 4. 제목 추출 (id: 0)
        const titleSentence = sentences.find((s) => s.id === 0);
        const title = titleSentence?.p || '제목 없음';

        // 5. DB에 저장
        const goalArticle = this.goalArticleRepository.create({
            article_url,
            title,
            contents: sentences,
        });
        const savedArticle = await this.goalArticleRepository.save(goalArticle);

        // 6. 각 문장별로 용어 추출 및 저장
        const sentenceDetails = await this.extractTermsForSentences(savedArticle.id, sentences);

        // 7. 응답 반환
        return {
            articleId: savedArticle.id,
            title: savedArticle.title,
            contents: savedArticle.contents,
            explanations: sentenceDetails,
        };
    }

    // 문장별 용어 추출 및 저장
    private async extractTermsForSentences(
        articlesId: number,
        sentences: ArticleSentenceContent[],
    ): Promise<ArticleSentence[]> {
        const savedSentences: ArticleSentence[] = [];

        for (const sentence of sentences) {
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

            const saved = await this.articleSentenceRepository.save(articleSentence);
            savedSentences.push(saved);
        }
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
