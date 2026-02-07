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
        description: '분석할 뉴스 기사 URL',
        example: 'https://www.example.com/news/123',
    })
    @IsString()
    @IsNotEmpty()
    article_url: string;
}

export class SentenceDto {
    @ApiProperty({ description: '문장 ID (0=제목)', example: 0 })
    id: number;

    @ApiProperty({ description: '문장 내용', example: '이것은 제목입니다.' })
    p: string;
}

export class AnalyzeNewsResponseDto {
    @ApiProperty({ description: '저장된 Goal Article ID' })
    articleId: number;
    @ApiProperty({ description: '기사 제목' })
    title: string;
    @ApiProperty({ description: '추출된 문장 배열', type: [SentenceDto] })
    contents: SentenceDto[];
}
