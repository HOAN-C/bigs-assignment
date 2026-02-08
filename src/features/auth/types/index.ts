// 회원가입 요청 body (POST /auth/signup)
export interface SignUpRequest {
  username: string;        // 사용자 아이디
  name: string;            // 표시 이름
  password: string;        // 비밀번호
  confirmPassword: string; // 비밀번호 확인
}

// 로그인 요청 body (POST /auth/signin)
export interface SignInRequest {
  username: string; // 사용자 아이디
  password: string; // 비밀번호
}

// 로그인 성공 응답 (POST /auth/signin, POST /auth/refresh 공통)
export interface AuthTokens {
  accessToken: string;  // JWT 액세스 토큰
  refreshToken: string; // JWT 리프레시 토큰
}
