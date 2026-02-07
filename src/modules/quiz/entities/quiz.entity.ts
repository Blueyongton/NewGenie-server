import { GoalArticle } from "src/modules/news/entities/goal-article.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('quiz')
export class Quiz {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => GoalArticle)
    @JoinColumn({ name: 'article_id' })
    article: GoalArticle;

    @Column({ name: 'article_id' })
    articleId: number;

    @Column({ type: 'boolean' })
    answer: boolean;

    @Column({ type: 'varchar', length: 512 })
    description: string;
}