export interface JwtPayload {
  sub: number; // 사용자 ID (JWT 표준: subject)
  kakaoId: string; // 카카오 ID
  nickname: string; // 닉네임
  iat?: number; // 발급 시간 (issued at)
  exp?: number; // 만료 시간 (expiration)
}
