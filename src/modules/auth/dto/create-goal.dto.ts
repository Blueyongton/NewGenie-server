import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateGoalDto {
    @ApiProperty({
        description: '목표 도메인',
        example: 'Politics',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    domain: string;

    @ApiProperty({
        description: '목표 개수',
        example: 3,
        required: true,
        type: Number,
    })
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    numbers: number;
}
