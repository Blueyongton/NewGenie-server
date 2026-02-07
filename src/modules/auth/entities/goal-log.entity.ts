import { GoalArticle } from "src/modules/news/entities/goal-article.entity";
import { User } from "src/modules/users/entities/user.entity";
import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

export enum GoalLogStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

@Entity('goal_logs')
@Unique(['user_id', 'date'])  // 유저당 날짜별로 하나만
export class GoalLog extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: string;

    @Column({ type: 'bigint', name: 'user_id' })
    user_id: string;

    @Column({ type: 'date' })
    date: Date;

    // Relations
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'int', name: 'target_count' })
    target_count: number;  // 그 날의 목표 개수

    @Column({ type: 'int', name: 'current_count', default: 0 })
    current_count: number;  // 현재 읽은 개수

    @Column({
        type: 'enum',
        enum: GoalLogStatus,
        default: GoalLogStatus.IN_PROGRESS,
    })
    status: GoalLogStatus;

    @OneToMany(() => GoalArticle, (article) => article.goalLog)
    articles: GoalArticle[];
}