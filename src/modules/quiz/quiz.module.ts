import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { QuizSchedulerService } from './quiz-scheduler.service';
import { Quiz } from './entities/quiz.entity';
import { NewGenie } from './entities/newgenie.entity';
import { GoalLog } from './entities/goal-log.entity';
import { GoalArticle } from './entities/goal-article.entity';
import { Goal } from './entities/goal.entity';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [
        ScheduleModule.forRoot(),
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
    providers: [QuizService, QuizSchedulerService],
    exports: [QuizService, QuizSchedulerService],
})
export class QuizModule {}
