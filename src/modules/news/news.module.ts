import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { GoalArticle } from './entities/goal-article.entity';
import { ArticleSentence } from './entities/article-sentence.entity';

@Module({
    imports: [TypeOrmModule.forFeature([News, GoalArticle, ArticleSentence])],
    controllers: [NewsController],
    providers: [NewsService],
})
export class NewsModule {}
