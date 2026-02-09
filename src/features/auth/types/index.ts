/** 회원가입 요청 body (POST /auth/signup) */
export interface SignUpRequest {
  /** 로그인에 사용할 고유 아이디 */
  username: string;
  /** 사용자 표시 이름 */
  name: string;
  password: string;
  /** 서버에서 password와 일치 여부를 검증한다 */
  confirmPassword: string;
}

/** 로그인 요청 body (POST /auth/signin) */
export interface SignInRequest {
  username: string;
  password: string;
}

/** 로그인/토큰 갱신 성공 시 서버가 반환하는 JWT 토큰 쌍 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
