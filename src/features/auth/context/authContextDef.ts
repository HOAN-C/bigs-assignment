/**
 * AuthContext 정의와 타입.
 * react-refresh 규칙에 따라 컴포넌트 파일과 분리한다.
 */
import { createContext } from "react";

export interface AuthContextValue {
  isAuthenticated: boolean;
  /** 로그아웃: 토큰 삭제 → onAuthChange 콜백이 상태 갱신 + 리다이렉트 처리 */
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
