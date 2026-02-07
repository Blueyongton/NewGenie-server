import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('news')
export class News extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;
}
