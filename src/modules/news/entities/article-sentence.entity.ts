import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { GoalArticle } from "./goal-article.entity";

export type ExplanationType = 'person' | 'company' | 'domain_terms';

export interface TermExplanation {
    type: ExplanationType;
    keyword: string;
    explain: string;
    detailed_explain: string;
}

@Entity('article_sentences')
@Unique(['article', 'sentenceId'])
export class ArticleSentence {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => GoalArticle, (article) => article.contents)
    @JoinColumn({ name: 'articles_id' })
    article: GoalArticle;

    @Column({ name: 'articles_id' })
    articlesId: number;

    @Column({ name: 'sentence_id' })
    sentenceId: number;

    @Column({ type: 'jsonb', default: [] })
    explanation: TermExplanation[];
}