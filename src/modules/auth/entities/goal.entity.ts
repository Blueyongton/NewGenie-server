import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('Goals')
export class Goal extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: string;

    @Column({ type: 'bigint', name: 'user_id' })
    user_id: string;

    @Column({ type: 'varchar' })
    domain: string;

    @Column({ type: 'int' })
    numbers: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
