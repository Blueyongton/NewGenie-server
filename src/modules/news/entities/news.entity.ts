import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('news')
export class News {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;
}
