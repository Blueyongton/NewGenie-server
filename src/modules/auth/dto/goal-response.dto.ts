import { ApiProperty } from '@nestjs/swagger';

export class GoalResponseDto {
    @ApiProperty({ description: '목표 ID', example: '23' })
    id: string;

    @ApiProperty({ description: '목표 도메인', example: 'Politics' })
    domain: string;

    @ApiProperty({ description: '목표 개수', example: 3 })
    numbers: number;

    constructor(partial: Partial<GoalResponseDto>) {
        Object.assign(this, partial);
    }
}
