/**
 * 인증 관련 커스텀 훅.
 *
 * useSignUp  — 회원가입 (성공해도 자동 로그인 안 됨, 별도 로그인 필요)
 * useSignIn  — 로그인 (성공 시 토큰을 tokenStorage에 저장)
 * useSignOut — 로그아웃 함수 반환 (서버에 로그아웃 API가 없어서 클라이언트 토큰만 삭제)
 */
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api";
import { tokenStorage } from "@/shared/api";
import type { SignUpRequest, SignInRequest } from "../types";

export const useSignUp = () => {
  return useMutation({
    mutationFn: (data: SignUpRequest) => authApi.signUp(data),
  });
};

export const useSignIn = () => {
  return useMutation({
    mutationFn: (data: SignInRequest) => authApi.signIn(data),
    onSuccess: (data) => {
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
    },
  });
};

export const useSignOut = () => {
  return () => {
    tokenStorage.clearTokens();
  };
};
