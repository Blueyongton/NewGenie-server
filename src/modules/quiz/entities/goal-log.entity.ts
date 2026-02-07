import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Goal_logs')
export class GoalLog {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: string;

    @Column({ type: 'bigint', name: 'user_id' })
    user_id: string;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ type: 'boolean' })
    status: boolean;
}
