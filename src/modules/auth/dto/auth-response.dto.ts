import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
    @ApiProperty({ description: '사용자 ID', example: '1' })
    id: number;

    @ApiProperty({ description: '카카오 ID', example: '4739186361' })
    kakao_id: string;

    @ApiProperty({ description: '사용자 닉네임', example: '홍길동' })
    nickname: string;

    @ApiProperty({
        description: '계정 생성 일시',
        example: '2026-02-07T15:00:00.000Z',
    })
    created_at: Date;

    @ApiProperty({
        description: 'JWT 액세스 토큰',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    access_token: string;

    constructor(partial: Partial<AuthResponseDto>) {
        Object.assign(this, partial);
    }
}
