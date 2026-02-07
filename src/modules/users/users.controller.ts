import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('사용자')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: '내 프로필 조회',
        description: 'JWT 토큰으로 인증된 사용자의 프로필을 조회합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '프로필 조회 성공',
        schema: {
            example: {
                id: '1',
                kakao_id: '4739186361',
                nickname: '홍길동',
            },
        },
    })
    @ApiResponse({ status: 401, description: '인증되지 않음' })
    getProfile(@Request() req: { user: Record<string, unknown> }) {
        return req.user;
    }

    @Get('goals')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: '내 목표 조회',
        description: 'JWT 토큰으로 인증된 사용자의 목표 목록을 조회합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '목표 조회 성공',
        schema: {
            example: [
                {
                    id: '1',
                    user_id: '1',
                    domain: 'Politics',
                    numbers: 3,
                },
                {
                    id: '2',
                    user_id: '1',
                    domain: 'Economy',
                    numbers: 5,
                },
            ],
        },
    })
    @ApiResponse({ status: 401, description: '인증되지 않음' })
    async getUserGoals(@Request() req: { user: { id: string } }) {
        return await this.usersService.findGoalsByUserId(req.user.id);
    }

    @Get('log')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: '내 목표 기사 로그 조회',
        description:
            'JWT 토큰으로 인증된 사용자의 모든 goal_articles를 최신순으로 조회합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '목표 기사 로그 조회 성공',
        schema: {
            example: [
                {
                    article_url: 'https://example.com/article/123',
                    contents: {
                        title: '정치 뉴스 제목',
                        summary: '뉴스 요약',
                    },
                },
                {
                    article_url: 'https://example.com/article/456',
                    contents: {
                        title: '경제 뉴스 제목',
                        summary: '뉴스 요약',
                    },
                },
            ],
        },
    })
    @ApiResponse({ status: 401, description: '인증되지 않음' })
    async getUserGoalArticles(@Request() req: { user: { id: string } }) {
        return await this.usersService.findGoalArticlesByUserId(req.user.id);
    }
}
