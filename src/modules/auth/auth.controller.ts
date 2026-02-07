import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    UseGuards,
    Request,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { KakaoLoginDto } from './dto/kakao-login.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @Post('kakao/login')
    @ApiOperation({
        summary: '[테스트용] 카카오 소셜 로그인',
        description:
            '⚠️ 이 API는 직접 호출하지 마세요!\n\n' +
            '카카오 로그인 플로우:\n' +
            '1. 프론트엔드에서 https://kauth.kakao.com/oauth/authorize 로 리다이렉트\n' +
            '2. 카카오가 자동으로 GET /auth/kakao/login/callback?code=xxx 를 호출\n' +
            '3. 백엔드가 JWT 토큰을 반환\n\n' +
            '이 POST API는 인가 코드를 수동으로 테스트할 때만 사용하세요.\n' +
            '일반적으로는 GET /auth/kakao/login/callback 엔드포인트가 자동으로 처리합니다.',
    })
    @ApiBody({
        type: KakaoLoginDto,
        description: '카카오 로그인 요청 데이터 (테스트용)',
    })
    @ApiResponse({
        status: 201,
        description: '로그인 성공',
        schema: {
            example: {
                id: '1',
                kakao_id: '4739186361',
                nickname: '홍길동',
                created_at: '2026-02-07T15:00:00.000Z',
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description:
            '잘못된 요청 (유효하지 않은 인가 코드 또는 리다이렉트 URI)',
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패 - 인가 코드가 만료되었거나 이미 사용되었습니다',
    })
    @ApiResponse({
        status: 500,
        description: '서버 오류',
    })
    async kakaoLogin(@Body() kakaoLoginDto: KakaoLoginDto) {
        return await this.authService.kakaoLogin(kakaoLoginDto);
    }

    @Get('kakao/login/callback')
    @ApiOperation({
        summary: '✅ 카카오 로그인 콜백 (메인 엔드포인트)',
        description:
            '카카오 OAuth 인증 후 자동으로 호출되는 콜백 엔드포인트입니다.\n\n' +
            '사용 방법:\n' +
            '1. 프론트엔드에서 다음 URL로 사용자를 리다이렉트:\n' +
            '   https://kauth.kakao.com/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={BACKEND_CALLBACK_URL}&response_type=code\n' +
            '   (redirect_uri는 이 엔드포인트 URL로 설정)\n' +
            '2. 사용자가 카카오 로그인 완료\n' +
            '3. 카카오가 이 엔드포인트를 호출 (code 전달)\n' +
            '4. 백엔드가 JWT 액세스 토큰을 생성\n' +
            '5. 프론트엔드로 리다이렉트 (토큰을 URL 프래그먼트에 포함)\n\n' +
            '⚠️ 프론트엔드는 리다이렉트된 URL의 #token 파라미터에서 JWT를 추출해야 합니다.\n' +
            '예: https://프론트엔드주소/callback#token=eyJhbGci...',
    })
    @ApiQuery({
        name: 'code',
        description: '카카오 인가 코드 (카카오가 자동으로 전달)',
        required: true,
        type: String,
        example: 'aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890',
    })
    @ApiResponse({
        status: 302,
        description: '로그인 성공 - 프론트엔드로 리다이렉트 (JWT 토큰 포함)',
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 요청 (인가 코드가 없음)',
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패 - 인가 코드가 만료되었거나 잘못되었습니다',
    })
    async kakaoLoginCallback(
        @Query('code') code: string,
        @Res() res: Response,
    ) {
        try {
            // 백엔드의 callback URL을 redirect_uri로 사용
            const backendCallbackUri = `${this.configService.get<string>('BASE_URL')}/auth/kakao/login/callback`;

            // 카카오 로그인 처리 및 JWT 생성
            const result = await this.authService.kakaoLogin({
                authorizationCode: code,
                redirectUri: backendCallbackUri,
            });

            // 프론트엔드 URL 가져오기
            const frontendUrl =
                this.configService.get<string>('FRONTEND_URL') ||
                'http://localhost:3000';

            // JWT 토큰을 URL 프래그먼트에 담아 프론트엔드로 리다이렉트
            const redirectUrl = `${frontendUrl}/callback#token=${result.access_token}&userId=${result.id}&nickname=${encodeURIComponent(result.nickname)}`;

            return res.redirect(redirectUrl);
        } catch (error) {
            // 에러 발생 시 프론트엔드 에러 페이지로 리다이렉트
            const frontendUrl =
                this.configService.get<string>('FRONTEND_URL') ||
                'http://localhost:3000';
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : '로그인 처리 중 오류가 발생했습니다';
            const redirectUrl = `${frontendUrl}/callback#error=${encodeURIComponent(errorMessage)}`;

            return res.redirect(redirectUrl);
        }
    }

    @Post('goals')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: '목표 생성',
        description: '인증된 사용자의 목표를 생성합니다.',
    })
    @ApiBody({ type: CreateGoalDto })
    @ApiResponse({
        status: 201,
        description: '목표 생성 성공',
        schema: {
            example: {
                resultType: 'SUCCESS',
                success: {
                    data: {
                        id: '23',
                        domain: 'Politics',
                        numbers: 3,
                    },
                },
                error: null,
                meta: {
                    timestamp: '2026-01-03T09:12:34.567Z',
                    path: '/auth/goals',
                },
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: '인증되지 않음',
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 요청',
    })
    async createGoal(
        @Body() createGoalDto: CreateGoalDto,
        @Request() req: { user: { id: string } },
    ) {
        return await this.authService.createGoal(req.user.id, createGoalDto);
    }
}
