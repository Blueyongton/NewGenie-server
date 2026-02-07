import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { Quiz } from './entities/quiz.entity';
import { NewGenie } from './entities/newgenie.entity';
import { GoalLog } from '../auth/entities/goal-log.entity';
import { GoalArticle } from '../news/entities/goal-article.entity';
import { Goal } from '../auth/entities/goal.entity';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Quiz,
            NewGenie,
            GoalLog,
            GoalArticle,
            Goal,
            User,
        ]),
    ],
    controllers: [QuizController],
    providers: [QuizService],
    exports: [QuizService],
})
export class QuizModule {}

