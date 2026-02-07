export class AuthResponseDto {
    id: number;
    kakao_id: string;
    nickname: string;
    created_at: Date;
    access_token: string;

    constructor(partial: Partial<AuthResponseDto>) {
        Object.assign(this, partial);
    }
}
