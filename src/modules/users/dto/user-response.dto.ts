export class UserResponseDto {
    id: number;
    kakao_id: string;
    nickname: string;
    created_at: Date;

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}
