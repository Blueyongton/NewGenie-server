import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GenerateQuizResponseDto, SubmitQuizRequestDto, SubmitQuizResponseDto } from './dtos/quiz.dto';

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

    @Post(':articleId/submit')
    @ApiOperation({
        summary: '퀴즈 답안 제출',
        description: '사용자의 O/X 답안을 제출하고 채점합니다. 결과에 따라 기사 상태가 업데이트됩니다.',
    })
    @ApiParam({
        name: 'articleId',
        description: '기사 ID',
        type: Number,
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: '채점 완료',
        type: SubmitQuizResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: '퀴즈를 찾을 수 없음',
    })
    async submit(
        @Param('articleId', ParseIntPipe) articleId: number,
        @Body() dto: SubmitQuizRequestDto,
    ): Promise<SubmitQuizResponseDto> {
        return this.quizService.submitQuiz(articleId, dto.answer);
    }
}
