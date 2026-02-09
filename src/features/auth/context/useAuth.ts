/**
 * AuthContext에서 인증 상태를 가져오는 훅.
 * react-refresh 규칙에 따라 컴포넌트 파일과 분리한다.
 */
import { useContext } from "react";
import { AuthContext } from "./authContextDef";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
