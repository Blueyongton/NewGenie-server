import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('NewGenie')
export class NewGenie {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: string;

    @Column({ type: 'bigint', name: 'user_id', unique: true })
    user_id: string;

    @Column({ type: 'int' })
    level: number;

    @Column({ type: 'boolean' })
    status: boolean;

    @Column({ type: 'int' })
    values: number;
}
