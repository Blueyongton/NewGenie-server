import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { KakaoLoginDto } from './dto/kakao-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('kakao/login')
  async kakaoLogin(@Body() kakaoLoginDto: KakaoLoginDto) {
    return await this.authService.kakaoLogin(
      kakaoLoginDto.authorizationCode,
      kakaoLoginDto.redirectUri,
    );
  }
}
