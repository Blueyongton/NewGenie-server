import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { GoalArticle } from '../news/entities/goal-article.entity';
import { LlmService } from 'src/common/llm/llm.service';

@Module({
    imports: [TypeOrmModule.forFeature([Quiz, GoalArticle])],
    controllers: [QuizController],
    providers: [QuizService, LlmService],
})
export class QuizModule {}
