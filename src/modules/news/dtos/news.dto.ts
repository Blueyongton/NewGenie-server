import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNewsDto {
    @ApiProperty({
        description: '뉴스 제목',
        example: '새로운 뉴스 제목',
    })
    @IsString()
    @IsNotEmpty()
    title: string;
}

export class AnalyzeNewsDto {
    @ApiProperty({
        description: '분석할 뉴스 본문',
        example: '오늘 한국은행이 기준금리를 0.25%p 인상했다...',
    })
    @IsString()
    @IsNotEmpty()
    content: string;
}

export class AnalyzeNewsResponseDto {
    @ApiProperty({ description: 'LLM 분석 결과' })
    analysis: string;
}