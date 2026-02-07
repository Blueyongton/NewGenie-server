import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiQuery,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { KakaoLoginDto } from './dto/kakao-login.dto';

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
            '1. 다음 URL로 사용자를 리다이렉트:\n' +
            '   https://kauth.kakao.com/oauth/authorize?client_id={CLIENT_ID}&redirect_uri=http://localhost:3000/auth/kakao/login/callback&response_type=code\n' +
            '2. 사용자가 카카오 로그인 완료\n' +
            '3. 카카오가 자동으로 이 엔드포인트를 호출하여 인가 코드 전달\n' +
            '4. 백엔드가 JWT 액세스 토큰을 생성하여 반환\n\n' +
            '⚠️ 이 엔드포인트는 브라우저 리다이렉트를 통해 자동으로 호출됩니다. Swagger UI에서 직접 테스트하지 마세요.',
    })
    @ApiQuery({
        name: 'code',
        description: '카카오 인가 코드 (카카오가 자동으로 전달)',
        required: true,
        type: String,
        example: 'aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890',
    })
    @ApiResponse({
        status: 200,
        description: '로그인 성공 - JWT 액세스 토큰 반환',
        schema: {
            example: {
                id: '1',
                kakao_id: '4739186361',
                nickname: '홍길동',
                created_at: '2026-02-07T15:00:00.000Z',
                access_token:
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwia2FrYW9faWQiOiI0NzM5MTg2MzYxIiwiaWF0IjoxNzcwNDc3MTMwLCJleHAiOjE3NzEwODE5MzB9.-HhyhBuZezjKWewZIyqN5SZHHhfppt4AYgGg3pvsQeM',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 요청 (인가 코드가 없음)',
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패 - 인가 코드가 만료되었거나 잘못되었습니다',
    })
    async kakaoLoginCallback(@Query('code') code: string) {
        // 카카오에서 리다이렉트한 URL의 redirectUri를 사용
        const redirectUri = `${this.configService.get<string>('BASE_URL') || 'http://localhost:3000'}/auth/kakao/login/callback`;

        return await this.authService.kakaoLogin({
            authorizationCode: code,
            redirectUri: redirectUri,
        });
    }
}
