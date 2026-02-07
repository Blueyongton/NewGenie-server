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
}
