import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { GoalArticle } from './entities/goal-article.entity';

@Module({
    imports: [TypeOrmModule.forFeature([News, GoalArticle])],
    controllers: [NewsController],
    providers: [NewsService],
})
export class NewsModule {}
