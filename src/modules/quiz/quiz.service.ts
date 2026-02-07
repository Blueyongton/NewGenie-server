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
            where: { articleId: Number(articleId) },
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
            where: { articleId: Number(articleId) },
        });

        if (!quiz) {
            throw new NotFoundException(
                `해당 기사 ID(${articleId})에 대한 퀴즈를 찾을 수 없습니다.`,
            );
        }

        // 2. 정답 비교
        const isCorrect = quiz.answer === submitAnswerDto.answer;

        // 정답일 경우 goal_article의 status를 CORRECT로 변경
        if (isCorrect) {
            // 해당 article_id로 goal_article 조회
            const goalArticle = await this.goalArticleRepository.findOne({
                where: { article_url: articleId },
            });

            if (goalArticle) {
                // goal_article의 status를 CORRECT로 변경
                goalArticle.status = GoalArticleStatus.CORRECT;
                await this.goalArticleRepository.save(goalArticle);

                const logId = goalArticle.log_id;

                // 해당 log_id와 동일한 log_id를 가지며, status가 CORRECT인 goal_article 개수 조회
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
    }
}
