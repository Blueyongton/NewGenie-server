import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Goal } from '../auth/entities/goal.entity';
import { GoalLog } from './entities/goal-log.entity';
import { GoalArticle } from './entities/goal-article.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Goal)
        private readonly goalRepository: Repository<Goal>,
        @InjectRepository(GoalLog)
        private readonly goalLogRepository: Repository<GoalLog>,
        @InjectRepository(GoalArticle)
        private readonly goalArticleRepository: Repository<GoalArticle>,
    ) {}

    async findByKakaoId(kakaoId: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { kakao_id: kakaoId },
        });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create(createUserDto);
        return await this.userRepository.save(user);
    }

    async findById(id: number): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { id },
        });
    }

    async findGoalsByUserId(userId: string): Promise<Goal[]> {
        return await this.goalRepository.find({
            where: { user_id: userId },
        });
    }

    async findGoalArticlesByUserId(
        userId: string,
    ): Promise<{ article_url: string; contents: object }[]> {
        // 1. 해당 유저의 모든 goal_log 조회
        const goalLogs = await this.goalLogRepository.find({
            where: { user_id: userId },
            order: { date: 'DESC' }, // 최신순 정렬
        });

        if (goalLogs.length === 0) {
            return [];
        }

        // 2. goal_log의 id들을 추출
        const logIds = goalLogs.map((log) => log.id);

        // 3. 해당 log_id들에 해당하는 모든 goal_articles 조회
        const goalArticles = await this.goalArticleRepository
            .createQueryBuilder('goal_article')
            .where('goal_article.log_id IN (:...logIds)', { logIds })
            .orderBy('goal_article.log_id', 'DESC')
            .getMany();

        // 4. article_url과 contents만 반환
        return goalArticles.map((article) => ({
            article_url: article.article_url,
            contents: article.contents,
        }));
    }
}
