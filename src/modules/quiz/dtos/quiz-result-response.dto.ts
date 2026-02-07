import { ApiProperty } from '@nestjs/swagger';
export class QuizResultResponseDto {
    @ApiProperty({
        description: '현재 레벨',
        example: 3,
    })
    level: number;
    @ApiProperty({
        description: '오늘 하루 목표를 달성했는지',
        example: true,
    })
    status: boolean;
    @ApiProperty({
        description: '방금 푼 퀴즈의 정답이 맞았는지',
        example: false,
    })
    answer: boolean;
    constructor(partial: Partial<QuizResultResponseDto>) {
        Object.assign(this, partial);
    }
}
