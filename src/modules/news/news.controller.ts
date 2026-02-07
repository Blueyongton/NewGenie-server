import { Body, Controller, Post } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dtos/news.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto.title);
  }
}
