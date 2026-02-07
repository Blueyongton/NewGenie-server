import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { KakaoLoginDto } from './dto/kakao-login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { GoalResponseDto } from './dto/goal-response.dto';
import { Goal } from './entities/goal.entity';
import { NewGenie } from '../auth/entities/newgenie.entity';
import {
    KakaoUserInfo,
    KakaoTokenResponse,
    KakaoErrorResponse,
} from './interfaces/kakao-user.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(Goal)
        private readonly goalsRepository: Repository<Goal>,
        @InjectRepository(NewGenie)
        private readonly newGenieRepository: Repository<NewGenie>,
    ) {}

    // 타입 가드 함수
    private isKakaoErrorResponse(obj: unknown): obj is KakaoErrorResponse {
        return (
            typeof obj === 'object' &&
            obj !== null &&
            'error' in obj &&
            typeof (obj as Record<string, unknown>).error === 'string'
        );
    }

    async kakaoLogin(kakaoLoginDto: KakaoLoginDto): Promise<AuthResponseDto> {
        // 1. 카카오 액세스 토큰 받기
        const kakaoAccessToken = await this.getKakaoAccessToken(
            kakaoLoginDto.authorizationCode,
            kakaoLoginDto.redirectUri,
        );

        // 2. 카카오 사용자 정보 가져오기
        const kakaoUser = await this.getKakaoUserInfo(kakaoAccessToken);

        // 3. 사용자 조회 또는 생성
        let user = await this.usersService.findByKakaoId(
            kakaoUser.id.toString(),
        );

        if (!user) {
            // 신규 사용자 생성
            user = await this.usersService.create({
                kakao_id: kakaoUser.id.toString(),
                nickname: kakaoUser.properties.nickname || '사용자',
            });
        }

        // 4. JWT 토큰 생성
        const accessToken = this.jwtService.sign({
            sub: user.id,
            kakao_id: user.kakao_id,
        });

        // 5. 응답 반환
        return new AuthResponseDto({
            id: user.id,
            kakao_id: user.kakao_id,
            nickname: user.nickname,
            created_at: user.created_at,
            access_token: accessToken,
        });
    }

    private async getKakaoAccessToken(
        authorizationCode: string,
        redirectUri: string,
    ): Promise<string> {
        const tokenUrl = 'https://kauth.kakao.com/oauth/token';
        const clientId = this.configService.get<string>('KAKAO_CLIENT_ID');
        const clientSecret = this.configService.get<string>(
            'KAKAO_CLIENT_SECRET',
        );

        if (!clientId) {
            throw new UnauthorizedException(
                '카카오 클라이언트 ID가 설정되지 않았습니다',
            );
        }

        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            redirect_uri: redirectUri,
            code: authorizationCode,
        });

        // Client Secret이 있는 경우 추가
        if (clientSecret) {
            params.append('client_secret', clientSecret);
        }

        console.log('카카오 토큰 요청:', {
            clientId,
            redirectUri,
            code: authorizationCode.substring(0, 10) + '...',
            hasClientSecret: !!clientSecret,
        });

        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });

            if (!response.ok) {
                const errorData: unknown = await response.json();
                console.error('카카오 토큰 발급 실패:', errorData);

                if (this.isKakaoErrorResponse(errorData)) {
                    throw new UnauthorizedException(
                        `카카오 토큰 발급 실패: ${errorData.error_description ?? errorData.error}`,
                    );
                }

                throw new UnauthorizedException('카카오 토큰 발급 실패');
            }

            const data = (await response.json()) as KakaoTokenResponse;
            return data.access_token;
        } catch (error) {
            console.error('카카오 인증 에러:', error);
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('카카오 인증 실패');
        }
    }

    private async getKakaoUserInfo(
        accessToken: string,
    ): Promise<KakaoUserInfo> {
        const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';

        try {
            const response = await fetch(userInfoUrl, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (!response.ok) {
                throw new UnauthorizedException('카카오 사용자 정보 조회 실패');
            }

            return (await response.json()) as KakaoUserInfo;
        } catch {
            throw new UnauthorizedException('카카오 사용자 정보 조회 실패');
        }
    }

    async createGoal(
        userId: string,
        createGoalDto: CreateGoalDto,
    ): Promise<GoalResponseDto> {
        // Goal 생성
        const goal = this.goalsRepository.create({
            user_id: userId,
            domain: createGoalDto.domain,
            numbers: createGoalDto.numbers,
        });

        const savedGoal = await this.goalsRepository.save(goal);

        // NewGenie 생성 (이미 존재하면 무시)
        const existingNewGenie = await this.newGenieRepository.findOne({
            where: { user_id: userId },
        });

        if (!existingNewGenie) {
            const newGenie = this.newGenieRepository.create({
                user_id: userId,
                level: 1, // 초기 레벨 1
                status: true, // 초기 상태 true (활성)
                values: 0, // 초기 값 0
            });

            await this.newGenieRepository.save(newGenie);
        }

        return new GoalResponseDto({
            id: savedGoal.id,
            domain: savedGoal.domain,
            numbers: savedGoal.numbers,
        });
    }
}
