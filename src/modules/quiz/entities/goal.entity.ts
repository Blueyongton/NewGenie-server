import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Goals')
export class Goal {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: string;

    @Column({ type: 'bigint', name: 'user_id' })
    user_id: string;

    @Column({ type: 'varchar' })
    domain: string;

    @Column({ type: 'int' })
    numbers: number;
}
