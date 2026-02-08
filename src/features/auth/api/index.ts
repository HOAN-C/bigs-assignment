/**
 * 인증 API 호출 함수 모음
 *
 * - signUp: 회원가입 요청 (POST /auth/signup). 응답 body 없음(void).
 * - signIn: 로그인 요청 (POST /auth/signin). accessToken과 refreshToken을 반환.
 *
 * 토큰 저장은 이 레이어에서 하지 않고, useAuth 훅의 onSuccess에서 처리한다.
 * (API 레이어는 순수 HTTP 호출만 담당)
 */
import { apiClient } from '@/shared/api';
import type { SignUpRequest, SignInRequest, AuthTokens } from '../types';

export const authApi = {
  // 회원가입: POST /auth/signup
  signUp: async (data: SignUpRequest): Promise<void> => {
    await apiClient.post('/auth/signup', data);
  },

  // 로그인: POST /auth/signin → { accessToken, refreshToken }
  signIn: async (data: SignInRequest): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>('/auth/signin', data);
    return response.data;
  },
};
