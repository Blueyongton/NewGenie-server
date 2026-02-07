import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
