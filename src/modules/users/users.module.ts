import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Goal } from '../auth/entities/goal.entity';
import { GoalLog } from './entities/goal-log.entity';
import { GoalArticle } from './entities/goal-article.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Goal, GoalLog, GoalArticle])],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
