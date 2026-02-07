import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    kakao_id: string;

    @IsString()
    @IsNotEmpty()
    nickname: string;
}
