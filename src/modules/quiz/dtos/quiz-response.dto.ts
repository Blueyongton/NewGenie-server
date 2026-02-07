import { ApiProperty } from '@nestjs/swagger';
export class QuizResponseDto {
    @ApiProperty({
        description: '퀴즈 설명',
        example: '이 기사의 내용은 정치 분야에 관한 것이다.',
    })
    description: string;
    constructor(partial: Partial<QuizResponseDto>) {
        Object.assign(this, partial);
    }
}
