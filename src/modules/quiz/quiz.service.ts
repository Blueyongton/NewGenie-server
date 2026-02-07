import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { NewGenie } from './entities/newgenie.entity';
import { GoalArticle, GoalArticleStatus } from './entities/goal-article.entity';
import { GoalLog } from './entities/goal-log.entity';
import { Goal } from './entities/goal.entity';
import { QuizResponseDto } from './dtos/quiz-response.dto';
import { SubmitAnswerDto } from './dtos/submit-answer.dto';
import { QuizResultResponseDto } from './dtos/quiz-result-response.dto';
import { Quiz } from './entities/quiz.entity';
import { Repository } from 'typeorm';
import { GoalArticle, GoalArticleStatus } from '../news/entities/goal-article.entity';
import { LlmService } from 'src/common/llm/llm.service';
import { GenerateQuizResponseDto, QuizLlmResponse, SubmitQuizResponseDto } from './dtos/quiz.dto';
import { QUIZ_PROMPT } from 'src/common/prompts/quiz.prompt';

@Injectable()
export class QuizService {
    constructor(
        @InjectRepository(Quiz)
        private readonly quizRepository: Repository<Quiz>,
        @InjectRepository(NewGenie)
        private readonly newGenieRepository: Repository<NewGenie>,
        @InjectRepository(GoalArticle)
        private readonly goalArticleRepository: Repository<GoalArticle>,
        @InjectRepository(GoalLog)
        private readonly goalLogRepository: Repository<GoalLog>,
        @InjectRepository(Goal)
        private readonly goalRepository: Repository<Goal>,
    ) {}

    async findByArticleId(articleId: string): Promise<QuizResponseDto> {
        const quiz = await this.quizRepository.findOne({
            where: { article_id: articleId },
        });

        if (!quiz) {
            throw new NotFoundException(
                `해당 기사 ID(${articleId})에 대한 퀴즈를 찾을 수 없습니다.`,
            );
        }

        return new QuizResponseDto({
            description: quiz.description,
        });
    }

    async submitAnswer(
        userId: string,
        articleId: string,
        submitAnswerDto: SubmitAnswerDto,
    ): Promise<QuizResultResponseDto> {
        // 1. 퀴즈 조회
        const quiz = await this.quizRepository.findOne({
            where: { article_id: articleId },
        });

        if (!quiz) {
            throw new NotFoundException(
                `해당 기사 ID(${articleId})에 대한 퀴즈를 찾을 수 없습니다.`,
            );
        }

        // 2. 정답 비교
        const isCorrect = quiz.answer === submitAnswerDto.answer;

        // 정답일 경우 goal_article의 status를 COMPLETED로 변경
        if (isCorrect) {
            // 해당 article_id로 goal_article 조회
            const goalArticle = await this.goalArticleRepository.findOne({
                where: { article_url: articleId }, // article_url에 articleId가 저장되어 있다고 가정
            });

            if (goalArticle) {
                // goal_article의 status를 COMPLETED로 변경
                goalArticle.status = GoalArticleStatus.CORRECT;
                await this.goalArticleRepository.save(goalArticle);

                const logId = goalArticle.log_id;

                // 해당 log_id와 동일한 log_id를 가지며, status가 COMPLETED인 goal_article 개수 조회
                const completedCount = await this.goalArticleRepository.count({
                    where: {
                        log_id: logId,
                        status: GoalArticleStatus.CORRECT,
                    },
                });

                // user의 goal 조회
                const userGoal = await this.goalRepository.findOne({
                    where: { user_id: userId },
                });

                if (userGoal && completedCount >= userGoal.numbers) {
                    // goal.numbers와 같으면 goal_log의 status를 true로 변경
                    await this.goalLogRepository.update(
                        { id: logId },
                        { status: true },
                    );

                    // user의 newgenie status를 true로 변경
                    await this.newGenieRepository.update(
                        { user_id: userId },
                        { status: true },
                    );
                }
            }

            // newgenie의 values를 1 증가시키고 레벨 업데이트
            const userNewGenie = await this.newGenieRepository.findOne({
                where: { user_id: userId },
            });

            if (userNewGenie) {
                // values 1 증가
                userNewGenie.values += 1;

                // values에 따라 레벨 업데이트
                if (userNewGenie.values > 200) {
                    userNewGenie.level = 3;
                } else if (userNewGenie.values > 100) {
                    userNewGenie.level = 2;
                } else {
                    userNewGenie.level = 1;
                }

                await this.newGenieRepository.save(userNewGenie);
            }
        }

        // 3. NewGenie 정보 조회
        const newGenie = await this.newGenieRepository.findOne({
            where: { user_id: userId },
        });

        if (!newGenie) {
            throw new NotFoundException(
                `해당 사용자의 NewGenie를 찾을 수 없습니다.`,
            );
        }

        // 4. 결과 반환
        return new QuizResultResponseDto({
            level: newGenie.level,
            status: newGenie.status,
            answer: isCorrect,
        });
        private quizRepository: Repository<Quiz>,
        @InjectRepository(GoalArticle)
        private goalArticleRepository: Repository<GoalArticle>,
        private llmService: LlmService
    ) {}

    async submitQuiz(articleId: number, userAnswer: boolean): Promise<SubmitQuizResponseDto> {
        // 1. 퀴즈 조회
        const quiz = await this.quizRepository.findOne({
            where: { articleId },
        })

        if (!quiz) {
            throw new NotFoundException(`퀴즈를 찾을 수 없습니다. (articleId: ${articleId})`);
        }

        // 2. 채점
        const isCorrect = quiz.answer === userAnswer;

        // 3. goal_articles 상태 업데이트
        const newStatus = isCorrect ? GoalArticleStatus.CORRECT : GoalArticleStatus.WRONG;

        await this.goalArticleRepository.update(
            { id: articleId },
            { status: newStatus }
        )

        console.log(`[퀴즈 채점] articleId: ${articleId}, 정답: ${isCorrect}, 상태: ${newStatus}`);

        // 4. 응답 반환
        return {
            isCorrect,
            correctAnswer: quiz.answer,
            description: quiz.description,
            articleStatus: newStatus,
        };
    }   

    async generateQuiz(articleId: number): Promise<GenerateQuizResponseDto> {
        // 1. 기존 퀴즈 확인 -> 있으면 기존 퀴즈 반환
        const existingQuiz = await this.quizRepository.findOne({
            where: { articleId },
        })

        if (existingQuiz) {
            console.log(`[기존 퀴즈 반환] articleId: ${articleId}, quizId: ${existingQuiz.id}`);
            return {
                id: existingQuiz.id,
                articleId: existingQuiz.articleId,
                answer: existingQuiz.answer,
                description: existingQuiz.description,
                isExisting: true,
            };
        }

        // 2. 기사 내용 조회
        const article = await this.goalArticleRepository.findOne({
            where: { id: articleId },
        })

        if (!article) {
            throw new NotFoundException(`기사를 찾을 수 없습니다. (id: ${articleId})`);
        }

        // 3. 기사 내용을 문자열로 변환
        const articleContent = article.contents
            .map((sentence) => sentence.p)
            .join('\n');

        // 4. LLM으로 퀴즈 생성
        console.log(`[퀴즈 생성 시작] articleId: ${articleId}`);
        const startTime = Date.now();
        
        const quizData = await this.llmService.invokeJson<QuizLlmResponse>(
            QUIZ_PROMPT.GENERATE_QUIZ,
            articleContent,
        );
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[퀴즈 생성 완료] 소요 시간: ${elapsed}초`);

        // 5. Quiz 엔티티 생성 및 저장
        const quiz = this.quizRepository.create({
            articleId,
            answer: quizData.answer,
            description: quizData.description,
        })

        const savedQuiz = await this.quizRepository.save(quiz);

        // 6. 응답 반환
        return {
            id: savedQuiz.id,
            articleId: savedQuiz.articleId,
            answer: savedQuiz.answer,
            description: savedQuiz.description,
            isExisting: false,
        }
    }
}
