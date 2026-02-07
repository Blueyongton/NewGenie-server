import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiResponse,
} from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dtos/news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyzeNewsDto, AnalyzeNewsResponseDto, CreateNewsDto } from './dtos/news.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('뉴스')
@Controller('news')
export class NewsController {
    constructor(private readonly newsService: NewsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '뉴스 생성' })
    @ApiResponse({ status: 201, description: '뉴스가 생성되었습니다.' })
    @ApiResponse({ status: 401, description: '인증되지 않음' })
    create(@Body() createNewsDto: CreateNewsDto) {
        return this.newsService.create(createNewsDto.title);
    }

    @Post('analyze')
    @ApiOperation({ summary: '뉴스 기사 분석' })
    @ApiResponse({ status: 200, description: '분석 결과', type: AnalyzeNewsResponseDto })
    async analyze(@Body() analyzeNewsDto: AnalyzeNewsDto) {
        const analysis = await this.newsService.analyze(analyzeNewsDto.content);
        return { analysis };
    }
}
