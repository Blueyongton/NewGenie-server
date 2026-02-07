import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum GoalArticleStatus {
    WRONG = 'WRONG',
    NOREAD = 'NOREAD',
    CORRECT = 'CORRECT'
}

@Entity('goal_articles')
export class GoalArticle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 512})
    article_url: string;

    @Column({
        type: 'enum',
        enum: GoalArticleStatus,
        default: GoalArticleStatus.NOREAD
    })
    status: GoalArticleStatus;
    @Column({
        type: 'jsonb',
        default: {}
    })
    contents: Record<string, any>;
}