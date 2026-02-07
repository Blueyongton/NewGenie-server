import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class KakaoLoginDto {
    @ApiProperty({
        description: '카카오 인가 코드',
        example: 'aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    authorizationCode: string;

    @ApiProperty({
        description: '카카오 로그인 리다이렉트 URI',
        example: 'http://localhost:3000/auth/kakao/callback',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    redirectUri: string;
}
