import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('User')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'varchar', unique: true })
    kakao_id: string;

    @Column({ type: 'varchar' })
    nickname: string;

}
