import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalLog } from './entities/goal-log.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class QuizSchedulerService {
    private readonly logger = new Logger(QuizSchedulerService.name);

    constructor(
        @InjectRepository(GoalLog)
        private readonly goalLogRepository: Repository<GoalLog>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    // 매일 자정(00:00)에 실행 (한국 시간 기준)
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
        timeZone: 'Asia/Seoul',
    })
    async createDailyGoalLogs() {
        this.logger.log('📅 일일 Goal Log 생성 작업 시작');

        try {
            // 1. 모든 활성 사용자 조회
            const users = await this.userRepository.find();

            if (users.length === 0) {
                this.logger.warn('⚠️ 활성 사용자가 없습니다');
                return;
            }

            this.logger.log(`👥 ${users.length}명의 사용자 발견`);

            // 2. 오늘 날짜 (한국 시간 기준)
            const today = new Date();
            today.setHours(0, 0, 0, 0); // 자정으로 설정

            // 3. 각 사용자별 Goal_log 생성
            let createdCount = 0;
            let skippedCount = 0;

            for (const user of users) {
                // 이미 오늘 날짜의 Goal_log가 있는지 확인
                const existingLog = await this.goalLogRepository.findOne({
                    where: {
                        user_id: user.id.toString(),
                        date: today,
                    },
                });

                if (existingLog) {
                    skippedCount++;
                    continue;
                }

                // Goal_log 생성
                const goalLog = this.goalLogRepository.create({
                    user_id: user.id.toString(),
                    date: today,
                    status: false, // 기본값
                });

                await this.goalLogRepository.save(goalLog);
                createdCount++;
            }

            this.logger.log(
                `✅ Goal Log 생성 완료 - 생성: ${createdCount}개, 건너뜀: ${skippedCount}개`,
            );
        } catch (error) {
            this.logger.error('❌ Goal Log 생성 실패:', error);
            throw error;
        }
    }

    // 테스트용: 수동으로 Goal Log 생성 (개발/디버깅용)
    async createGoalLogsManually() {
        this.logger.log('🔧 수동 Goal Log 생성 시작');
        await this.createDailyGoalLogs();
    }
}
