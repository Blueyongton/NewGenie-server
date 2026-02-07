import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
    sub: string; // 사용자 ID
    kakao_id: string; // 카카오 ID
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload) {
        // JWT 페이로드에서 사용자 정보 추출
        const user = await this.usersService.findByKakaoId(payload.kakao_id);

        if (!user) {
            throw new UnauthorizedException('사용자를 찾을 수 없습니다');
        }

        // request.user에 저장될 객체
        return {
            id: user.id,
            kakao_id: user.kakao_id,
            nickname: user.nickname,
        };
    }
}
