import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import {
    AnalyzeNewsDto,
    AnalyzeNewsResponseDto,
    CreateNewsDto,
    SentenceDetailResponseDto,
} from './dtos/news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

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

    @Get(':articleId/:sentenceId')
    @ApiOperation({
        summary: '문장 조회',
        description: 'deatil=true 시 상세 설명을 생성하여 반환합니다. 이미 생성되어 있으면 조회만 합니다.'
    })
    @ApiParam({ name: 'articleId', description: '기사 ID'})
    @ApiParam({ name: 'sentenceId', description: '문장 ID (0=제목)'})
    @ApiQuery({
        name: 'detail',
        required: false,
        type: Boolean,
        description: '상세 설명 생성 여부 (true/false)'
    })
    @ApiResponse({ status: 200, type: SentenceDetailResponseDto })
    async getSentenceDetail(
        @Param('articleId', ParseIntPipe) articleId: number,
        @Param('sentenceId', ParseIntPipe) sentenceId: number,
        @Query('detail') detail?: string,
    ): Promise<SentenceDetailResponseDto> {
        const generateDatail = detail === 'true';
        return this.newsService.getSentenceDetail(
            articleId,
            sentenceId,
            generateDatail
        )
    }
}
