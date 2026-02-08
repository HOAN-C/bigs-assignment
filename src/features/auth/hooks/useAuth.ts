/**
 * 인증 관련 React Query 커스텀 훅
 *
 * - useSignUp: 회원가입 mutation. 성공해도 토큰 저장은 하지 않음 (별도 로그인 필요).
 * - useSignIn: 로그인 mutation. 성공 시 응답의 토큰을 tokenStorage에 저장.
 * - useSignOut: 로그아웃 함수를 반환하는 훅. tokenStorage의 토큰만 삭제.
 *              서버 로그아웃 API가 없으므로 클라이언트에서만 처리한다.
 */
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api';
import { tokenStorage } from '@/shared/api';
import type { SignUpRequest, SignInRequest } from '../types';

// 회원가입 mutation 훅
export const useSignUp = () => {
  return useMutation({
    mutationFn: (data: SignUpRequest) => authApi.signUp(data),
  });
};

// 로그인 mutation 훅: 성공 시 토큰을 메모리/쿠키에 저장
export const useSignIn = () => {
  return useMutation({
    mutationFn: (data: SignInRequest) => authApi.signIn(data),
    onSuccess: (data) => {
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
    },
  });
};

// 로그아웃 훅: 토큰 삭제 함수를 반환 (mutation이 아닌 단순 함수)
export const useSignOut = () => {
  return () => {
    tokenStorage.clearTokens();
  };
};
