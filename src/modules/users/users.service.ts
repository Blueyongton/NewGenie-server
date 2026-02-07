import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findByKakaoId(kakaoId: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { kakao_id: kakaoId },
        });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create(createUserDto);
        return await this.userRepository.save(user);
    }

    async findById(id: number): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { id },
        });
    }
}
