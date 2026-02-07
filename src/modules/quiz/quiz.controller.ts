import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GenerateQuizResponseDto } from './dtos/quiz.dto';

@Controller('quiz')
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @Post(':articleId')
    @ApiOperation({
        summary: '기사 기반 O/X 퀴즈 생성',
        description: '기사 내용을 기반으로 핵심 O/X 퀴즈를 생성합니다. 이미 퀴즈가 존재하면 기존 퀴즈를 반환합니다.'
    })
    @ApiParam({ 
        name: 'articleId', 
        description: '기사 ID', 
        type: Number,
        example: 1,
    })
    @ApiResponse({ 
        status: 201, 
        description: '퀴즈 생성 성공 또는 기존 퀴즈 반환', 
        type: GenerateQuizResponseDto,
    })
    @ApiResponse({ 
        status: 404, 
        description: '기사를 찾을 수 없음',
    })
    async generate(
        @Param('articleId', ParseIntPipe) articleId: number,
    ): Promise<GenerateQuizResponseDto> {
        return this.quizService.generateQuiz(articleId);
    }
}
