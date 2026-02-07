import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {
    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updated_at: Date;
}
