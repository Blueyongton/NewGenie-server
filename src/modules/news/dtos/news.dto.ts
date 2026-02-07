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

// 추출
export class TermExplanationDto {
    @ApiProperty({ 
        description: '용어 타입', 
        enum: ['person', 'company', 'domain_terms'] 
    })
    type: 'person' | 'company' | 'domain_terms';
    @ApiProperty({ description: '키워드', example: '이재용' })
    keyword: string;
    @ApiProperty({ description: '간단한 설명', example: '현재 삼성전자의 회장이다.' })
    explain: string;
    @ApiProperty({ 
        description: '상세 설명', 
        example: '이재용은 부회장 취임 이후...' 
    })
    detailed_explain: string;
}

export class ArticleSentenceResponseDto {
    @ApiProperty({ description: '문장 고유 ID (DB)' })
    id: number;
    @ApiProperty({ description: '문장 순서 ID (0=제목)' })
    sentenceId: number;
    @ApiProperty({ 
        description: '추출된 용어 설명', 
        type: [TermExplanationDto] 
    })
    explanations: TermExplanationDto[];
}

export class AnalyzeNewsResponseDto {
    @ApiProperty({ description: '저장된 Goal Article ID' })
    articleId: number;
    @ApiProperty({ description: '기사 제목' })
    title: string;
    @ApiProperty({ description: '추출된 문장 배열', type: [SentenceDto] })
    contents: SentenceDto[];
    @ApiProperty({
        description: '문장별 용어 설명',
        type: [ArticleSentenceResponseDto]
    })
    explanations: ArticleSentenceResponseDto[];
}
