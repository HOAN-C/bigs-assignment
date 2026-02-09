/**
 * 인증 관련 커스텀 훅.
 *
 * useSignUp — 회원가입 (성공해도 자동 로그인 안 됨, 별도 로그인 필요)
 * useSignIn — 로그인 (성공 시 tokenStorage.setTokens → onAuthChange(true)로 상태 동기화)
 *
 * 로그아웃은 AuthContext.signOut()을 사용한다 (tokenStorage.clearTokens 호출).
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
