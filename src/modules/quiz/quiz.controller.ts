import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { SubmitAnswerDto } from './dtos/submit-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('퀴즈')
@Controller('quiz')
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @Get(':articleId')
    @ApiOperation({
        summary: '기사 ID로 퀴즈 조회',
        description: '기사 ID에 해당하는 퀴즈 설명을 조회합니다.',
    })
    @ApiParam({
        name: 'articleId',
        description: '기사 ID',
        example: '123',
        type: String,
    })
    @ApiResponse({
        status: 200,
        description: '퀴즈 조회 성공',
        schema: {
            example: {
                resultType: 'SUCCESS',
                success: {
                    data: {
                        description:
                            '이 기사의 내용은 정치 분야에 관한 것이다.',
                    },
                },
                error: null,
                meta: {
                    timestamp: '2026-02-08T01:30:00.000Z',
                    path: '/quiz/123',
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: '퀴즈를 찾을 수 없음',
    })
    async getQuizByArticleId(@Param('articleId') articleId: string) {
        return await this.quizService.findByArticleId(articleId);
    }

    @Post(':articleId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: '퀴즈 정답 제출',
        description:
            '기사 ID에 해당하는 퀴즈의 정답을 제출하고 결과를 확인합니다.',
    })
    @ApiParam({
        name: 'articleId',
        description: '기사 ID',
        example: '123',
        type: String,
    })
    @ApiBody({ type: SubmitAnswerDto })
    @ApiResponse({
        status: 201,
        description: '정답 제출 성공',
        schema: {
            example: {
                resultType: 'SUCCESS',
                success: {
                    data: {
                        level: 3,
                        status: true,
                        answer: false,
                    },
                },
                error: null,
                meta: {
                    timestamp: '2026-01-03T09:12:34.567Z',
                    path: '/quiz/123',
                },
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: '인증되지 않음',
    })
    @ApiResponse({
        status: 404,
        description: '퀴즈 또는 NewGenie를 찾을 수 없음',
    })
    async submitAnswer(
        @Param('articleId') articleId: string,
        @Body() submitAnswerDto: SubmitAnswerDto,
        @Request() req: { user: { id: string } },
    ) {
        return await this.quizService.submitAnswer(
            req.user.id,
            articleId,
            submitAnswerDto,
        );
    }
}
