import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { GoalArticle } from './entities/goal-article.entity';
import { ArticleSentence } from './entities/article-sentence.entity';
import { Goal } from '../auth/entities/goal.entity';
import { GoalLog } from '../auth/entities/goal-log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([News, GoalArticle, ArticleSentence, Goal, GoalLog])],
    controllers: [NewsController],
    providers: [NewsService],
})
export class NewsModule {}
