import { Body, Controller, Post } from '@nestjs/common';
import { NewsService } from './news.service';
import {
    AnalyzeNewsDto,
    AnalyzeNewsResponseDto,
    CreateNewsDto,
} from './dtos/news.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('news')
export class NewsController {
    constructor(private readonly newsService: NewsService) {}

    @Post()
    create(@Body() createNewsDto: CreateNewsDto) {
        return this.newsService.create(createNewsDto.title);
    }

    @Post('analyze')
    @ApiOperation({ summary: '뉴스 기사 분석' })
    @ApiResponse({
        status: 200,
        description: '분석 결과',
        type: AnalyzeNewsResponseDto,
    })
    async analyze(
        @Body() analyzeNewsDto: AnalyzeNewsDto,
    ): Promise<AnalyzeNewsResponseDto> {
        return this.newsService.analyzeFromUrl(analyzeNewsDto.article_url);
    }
}
