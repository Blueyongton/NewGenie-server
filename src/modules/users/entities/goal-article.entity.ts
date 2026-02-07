import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum GoalArticleStatus {
    NOREAD = 'NOREAD',
    CORRECT = 'CORRECT',
    WRONG = 'WRONG',
}

@Entity('Goal_articles')
export class GoalArticle {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: string;

    @Column({ type: 'bigint', name: 'log_id' })
    log_id: string;

    @Column({ type: 'varchar', length: 512, name: 'article_url' })
    article_url: string;

    @Column({ type: 'enum', enum: GoalArticleStatus })
    status: GoalArticleStatus;

    @Column({ type: 'json' })
    contents: object;
}
