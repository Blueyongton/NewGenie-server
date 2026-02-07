import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SubmitAnswerDto {
    @ApiProperty({
        description: '퀴즈 정답 (true/false)',
        example: true,
        required: true,
    })
    @IsBoolean()
    @IsNotEmpty()
    answer: boolean;
}
