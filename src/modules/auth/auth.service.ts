import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
}

interface KakaoUserInfo {
  id: number;
  kakao_account: {
    profile?: {
      nickname?: string;
    };
  };
}

@Injectable()
export class AuthService {
  constructor(
    // @InjectRepository(User)
    // private userRepository: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  /**
   * 카카오 로그인 처리
   * 1. authorizationCode로 카카오 액세스 토큰 발급
   * 2. 액세스 토큰으로 카카오 사용자 정보 조회
   * 3. DB에서 사용자 조회 또는 신규 생성
   */
  async kakaoLogin(authorizationCode: string, redirectUri: string) {
    try {
      // 1. 카카오 액세스 토큰 발급
      const kakaoToken = await this.getKakaoAccessToken(
        authorizationCode,
        redirectUri,
      );

      // 2. 카카오 사용자 정보 조회
      const kakaoUserInfo = await this.getKakaoUserInfo(
        kakaoToken.access_token,
      );

      // 3. 사용자 조회 또는 생성
      const user = this.findOrCreateUser(kakaoUserInfo);

      // 4. JWT 토큰 생성
      const payload: JwtPayload = {
        sub: user.id,
        kakaoId: user.kakao_id,
        nickname: user.nickname,
      };
      const accessToken = this.jwtService.sign(payload);

      return {
        user: {
          id: user.id,
          kakaoId: user.kakao_id,
          nickname: user.nickname,
        },
        accessToken,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        '카카오 로그인 처리 중 오류가 발생했습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 카카오 인가 코드로 액세스 토큰 발급
   */
  private async getKakaoAccessToken(
    authorizationCode: string,
    redirectUri: string,
  ): Promise<KakaoTokenResponse> {
    const kakaoClientId = this.configService.get<string>('KAKAO_CLIENT_ID');
    const kakaoClientSecret = this.configService.get<string>(
      'KAKAO_CLIENT_SECRET',
    );

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: kakaoClientId!,
      redirect_uri: redirectUri,
      code: authorizationCode,
      ...(kakaoClientSecret && { client_secret: kakaoClientSecret }),
    });

    try {
      const response = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as {
          error?: string;
          error_description?: string;
        };
        throw new HttpException(
          `카카오 토큰 발급 실패: ${errorData.error_description || errorData.error || 'Unknown error'}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return (await response.json()) as KakaoTokenResponse;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        '카카오 토큰 발급 중 오류가 발생했습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 카카오 액세스 토큰으로 사용자 정보 조회
   */
  private async getKakaoUserInfo(accessToken: string): Promise<KakaoUserInfo> {
    try {
      const response = await fetch('https://kapi.kakao.com/v2/user/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });

      if (!response.ok) {
        throw new HttpException(
          '카카오 사용자 정보 조회 실패',
          HttpStatus.BAD_REQUEST,
        );
      }

      return (await response.json()) as KakaoUserInfo;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        '카카오 사용자 정보 조회 중 오류가 발생했습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 사용자 조회 또는 신규 생성
   * TODO: User 엔티티 생성 후 실제 DB 작업으로 교체 필요
   */
  private findOrCreateUser(kakaoUserInfo: KakaoUserInfo) {
    const kakaoId = kakaoUserInfo.id.toString();
    const nickname =
      kakaoUserInfo.kakao_account.profile?.nickname || `user_${kakaoId}`;

    // TODO: User 엔티티 생성 후 아래 코드로 교체
    /*
    let user = await this.userRepository.findOne({
      where: { kakao_id: kakaoId },
    });

    if (!user) {
      user = this.userRepository.create({
        kakao_id: kakaoId,
        nickname: nickname,
      });
      await this.userRepository.save(user);
    }

    return user;
    */

    // 임시 반환 데이터 (실제 DB 연동 전)
    return {
      id: 1,
      kakao_id: kakaoId,
      nickname: nickname,
      created_at: new Date(),
    };
  }
}
