/**
 * 인증 API 함수.
 *
 * 이 레이어는 순수하게 HTTP 요청만 담당한다.
 * 토큰 저장 같은 부수효과는 useAuth 훅의 onSuccess에서 처리한다.
 */
import { apiClient } from "@/shared/api";
import type { SignUpRequest, SignInRequest, AuthTokens } from "../types";

export const authApi = {
  /** POST /auth/signup — 회원가입 (응답 body 없음) */
  signUp: async (data: SignUpRequest): Promise<void> => {
    await apiClient.post("/auth/signup", data);
  },

  /** POST /auth/signin — 로그인 (토큰 쌍 반환) */
  signIn: async (data: SignInRequest): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>("/auth/signin", data);
    return response.data;
  },
};
