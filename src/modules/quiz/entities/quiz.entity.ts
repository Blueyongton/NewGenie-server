import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Quiz')
export class Quiz {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: string;

    @Column({ type: 'bigint', name: 'article_id', unique: true })
    article_id: string;

    @Column({ type: 'boolean' })
    answer: boolean;

    @Column({ type: 'varchar', length: 512 })
    description: string;
}
