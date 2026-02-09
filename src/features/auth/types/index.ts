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

/** accessToken JWT payload (HS256) */
export interface TokenPayload {
  /** 사용자 표시 이름 */
  name: string;
  /** 로그인 아이디 (이메일) */
  username: string;
  /** 발급 시각 (Unix timestamp, 초) */
  iat: number;
  /** 만료 시각 (Unix timestamp, 초) */
  exp: number;
}

/** 스토어에 저장할 사용자 정보 (토큰에서 추출) */
export interface AuthUser {
  name: string;
  username: string;
}
