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
}
