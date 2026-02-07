import { ApiProperty } from "@nestjs/swagger";

export class GenerateQuizResponseDto {
    @ApiProperty({ description: '퀴즈 고유 ID', example: 1 })
    id: number;
    @ApiProperty({ description: '기사 ID', example: 1 })
    articleId: number;
    @ApiProperty({ description: 'O/X 정답 (true=O, false=X)', example: false })
    answer: boolean;
    @ApiProperty({ 
        description: '문제 내용', 
        example: '비트코인이 10만 달러를 돌파했다.' 
    })
    description: string;
    @ApiProperty({ 
        description: '기존 퀴즈 반환 여부 (true면 이미 존재하던 퀴즈)', 
        example: false 
    })
    isExisting: boolean;
}

// LLM 응답 파싱용 인터페이스
export interface QuizLlmResponse {
    answer: boolean;
    description: string;
}