/**
 * Zustand 기반 인증 상태 스토어.
 *
 * Provider 없이 어디서든 `useAuthStore()`로 인증 상태와 사용자 정보를 구독한다.
 * 토큰 변경 시 각 호출부에서 직접 스토어 상태를 갱신한다:
 *   - 로그인/토큰 갱신 성공: setTokens → decodeAccessToken → setUser + setAuthenticated
 *   - 인증 실패/로그아웃: forceSignOut / signOut
 */
import { create } from "zustand";
import { tokenStorage } from "@/shared/api";
import type { AuthUser } from "../types";

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  setAuthenticated: (value: boolean) => void;
  /** 로그인 성공 시 디코딩된 사용자 정보를 저장한다 */
  setUser: (user: AuthUser | null) => void;
  /** 로그아웃: 토큰 삭제 + 상태 초기화 + /login 리다이렉트 */
  signOut: () => void;
  /** 인증 실패 시 강제 로그아웃 (인터셉터에서 사용) */
  forceSignOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: tokenStorage.hasTokens(),
  user: null,

  setAuthenticated: (value: boolean) => {
    set({ isAuthenticated: value });
  },

  setUser: (user: AuthUser | null) => {
    set({ user });
  },

  signOut: () => {
    tokenStorage.clearTokens();
    set({ isAuthenticated: false, user: null });
    window.location.replace("/login");
  },

  forceSignOut: () => {
    tokenStorage.clearTokens();
    set({ isAuthenticated: false, user: null });
    window.location.replace("/login");
  },
}));
