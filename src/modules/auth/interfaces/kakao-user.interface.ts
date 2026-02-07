export interface KakaoUserInfo {
    id: number;
    properties: {
        nickname: string;
    };
}

export interface KakaoTokenResponse {
    access_token: string;
    token_type: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
    refresh_token_expires_in: number;
}

export interface KakaoErrorResponse {
    error: string;
    error_description?: string;
    error_code?: string;
}
