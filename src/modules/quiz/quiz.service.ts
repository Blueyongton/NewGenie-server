import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { NewGenie } from './entities/newgenie.entity';
import { QuizResponseDto } from './dtos/quiz-response.dto';
import { SubmitAnswerDto } from './dtos/submit-answer.dto';
import { QuizResultResponseDto } from './dtos/quiz-result-response.dto';

@Injectable()
export class QuizService {
    constructor(
        @InjectRepository(Quiz)
        private readonly quizRepository: Repository<Quiz>,
        @InjectRepository(NewGenie)
        private readonly newGenieRepository: Repository<NewGenie>,
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
    }
}
