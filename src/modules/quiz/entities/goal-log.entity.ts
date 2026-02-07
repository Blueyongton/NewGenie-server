import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('Goal_logs')
@Index(['user_id', 'date'], { unique: true }) // 하루에 하나만 생성되도록 unique 제약
export class GoalLog {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: string;

    @Column({ type: 'bigint', name: 'user_id' })
    user_id: string;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ type: 'boolean', default: false })
    status: boolean;
}
