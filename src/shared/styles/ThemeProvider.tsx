/**
 * styled-components ThemeProvider를 Zustand 스토어와 연결하는 래퍼.
 *
 * useThemeStore에서 현재 mode를 읽어 적절한 테마 객체를 주입한다.
 * Context 없이 동작하므로 Provider 트리가 단순해진다.
 */
import type { ReactNode } from "react";
import { ThemeProvider as SCThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "./theme";
import { useThemeStore } from "./useThemeStore";

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const theme = mode === "light" ? lightTheme : darkTheme;
  return <SCThemeProvider theme={theme}>{children}</SCThemeProvider>;
}
