/**
 * Zustand 기반 테마 상태 스토어.
 *
 * Provider 없이 어디서든 `useThemeStore()`로 테마 모드를 구독한다.
 * localStorage에 사용자 선호 테마를 저장하고,
 * 저장값 없으면 OS의 prefers-color-scheme 설정을 따른다.
 */
import { create } from "zustand";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "theme-mode";

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: getInitialMode(),
  toggleTheme: () => {
    set((state) => {
      const next = state.mode === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      return { mode: next };
    });
  },
}));
