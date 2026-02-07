import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { QuizSchedulerService } from './quiz-scheduler.service';
import { GoalLog } from './entities/goal-log.entity';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([GoalLog, User]),
    ],
    controllers: [QuizController],
    providers: [QuizService, QuizSchedulerService],
    exports: [QuizService, QuizSchedulerService],
})
export class QuizModule {}
