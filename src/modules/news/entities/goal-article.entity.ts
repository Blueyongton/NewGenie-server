import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ArticleSentence as ArticleSentenceEntity } from './article-sentence.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { GoalLog } from 'src/modules/auth/entities/goal-log.entity';

export enum GoalArticleStatus {
    WRONG = 'WRONG',
    NOREAD = 'NOREAD',
    CORRECT = 'CORRECT',
}

export interface ArticleSentence {
    id: number;
    p: string;
}

@Entity('goal_articles')
@Index(['user_id', 'date'])
export class GoalArticle extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'bigint', name: 'user_id' })
    user_id: string;

    @Column({ type: 'bigint', name: 'log_id', nullable: true })
    log_id: string | null;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'varchar', length: 256 })
    title: string;

    @Column({ type: 'varchar', length: 512 })
    article_url: string;

    @Column({
        type: 'enum',
        enum: GoalArticleStatus,
        default: GoalArticleStatus.NOREAD,
    })
    status: GoalArticleStatus;

    @Column({
        type: 'jsonb',
        default: [],
    })
    contents: ArticleSentence[];

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => GoalLog, { nullable: true })
    @JoinColumn({ name: 'log_id' })
    goalLog: GoalLog;

    @OneToMany(() => ArticleSentenceEntity, (sentence) => sentence.article)
    sentences: ArticleSentenceEntity[];
}
