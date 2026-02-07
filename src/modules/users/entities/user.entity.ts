import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity('User')
export class User {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'varchar', unique: true })
    kakao_id: string;

    @Column({ type: 'varchar' })
    nickname: string;

    @CreateDateColumn({ type: 'timestamp', precision: 6 })
    created_at: Date;
}
