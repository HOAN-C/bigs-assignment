/**
 * Zustand 기반 인증 상태 스토어.
 *
 * Provider 없이 어디서든 `useAuthStore()`로 인증 상태를 구독한다.
 * 토큰 변경 시 각 호출부에서 직접 스토어 상태를 갱신한다:
 *   - 로그인 성공: useSignIn 훅에서 setTokens + setAuthenticated(true)
 *   - 토큰 갱신 성공: client.ts 인터셉터에서 setTokens + setAuthenticated(true)
 *   - 인증 실패/로그아웃: clearTokens + forceSignOut()
 */
import { create } from "zustand";
import { tokenStorage } from "@/shared/api";

interface AuthState {
  isAuthenticated: boolean;
  /** 인증 상태를 직접 변경한다 (로그인 성공, 토큰 갱신 성공 시 사용) */
  setAuthenticated: (value: boolean) => void;
  /** 로그아웃: 토큰 삭제 + 인증 해제 + /login 리다이렉트 */
  signOut: () => void;
  /** 인증 실패 시 강제 로그아웃 + /login 리다이렉트 (인터셉터에서 사용) */
  forceSignOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: tokenStorage.hasTokens(),

  setAuthenticated: (value: boolean) => {
    set({ isAuthenticated: value });
  },

  signOut: () => {
    tokenStorage.clearTokens();
    set({ isAuthenticated: false });
    window.location.replace("/login");
  },

  forceSignOut: () => {
    tokenStorage.clearTokens();
    set({ isAuthenticated: false });
    window.location.replace("/login");
  },
}));
