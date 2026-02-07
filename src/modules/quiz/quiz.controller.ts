import { Controller, Post, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiResponse,
} from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { QuizSchedulerService } from './quiz-scheduler.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('퀴즈')
@Controller('quiz')
export class QuizController {
    constructor(
        private readonly quizService: QuizService,
        private readonly quizSchedulerService: QuizSchedulerService,
    ) {}

    @Post('create-daily-logs')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: '수동으로 일일 Goal Log 생성 (테스트용)',
        description:
            '모든 사용자에 대해 오늘 날짜의 Goal Log를 생성합니다. 이미 생성된 경우 건너뜁니다.',
    })
    @ApiResponse({
        status: 201,
        description: 'Goal Log 생성 완료',
    })
    @ApiResponse({
        status: 401,
        description: '인증되지 않음',
    })
    async createDailyLogs() {
        await this.quizSchedulerService.createGoalLogsManually();
        return {
            message: 'Goal Log 생성 작업이 완료되었습니다. 로그를 확인하세요.',
        };
    }
}
