/**
 * 인증 상태를 앱 전역에서 공유하는 Provider 컴포넌트.
 *
 * tokenStorage의 hasTokens()로 로그인 여부를 판별하고,
 * 로그인/로그아웃 시 상태를 갱신하여 NavHeader, ProtectedRoute 등이 즉시 반응하게 한다.
 *
 * 새로고침 시 accessToken은 메모리에서 사라지지만 refreshToken 쿠키는 남아있다.
 * 이때 앱이 초기화되면서 hasTokens() → true로 로그인 상태를 유지하고,
 * 첫 API 호출 시 인터셉터가 자동으로 accessToken을 재발급받는다.
 *
 * 인터셉터에서 토큰 갱신 실패 시 clearTokens()를 호출하는데,
 * 이 변화를 React 상태에 반영하기 위해 onAuthChange 콜백을 tokenStorage에 등록한다.
 * 인증이 해제되면 자동으로 /login으로 리다이렉트한다.
 */
import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { tokenStorage } from "@/shared/api";
import { AuthContext } from "./authContextDef";

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    tokenStorage.hasTokens(),
  );

  // 이전 인증 상태를 추적하여 "로그인 → 로그아웃" 전환 시에만 리다이렉트
  const prevAuthRef = useRef(isAuthenticated);

  /**
   * tokenStorage의 변경 사항을 React 상태에 동기화한다.
   * 인터셉터가 clearTokens()를 호출하면 이 콜백이 실행되어 UI가 로그아웃 상태로 전환된다.
   */
  useEffect(() => {
    tokenStorage.onAuthChange = (authenticated: boolean) => {
      setIsAuthenticated(authenticated);
    };
    return () => {
      tokenStorage.onAuthChange = null;
    };
  }, []);

  /**
   * 인증 상태가 true → false로 변경되면 /login으로 리다이렉트한다.
   * 인터셉터에서 refresh 실패로 clearTokens()가 호출된 경우,
   * 또는 signOut()이 호출된 경우 모두 여기서 처리된다.
   */
  useEffect(() => {
    if (prevAuthRef.current && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, navigate]);

  const markAsAuthenticated = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(() => {
    tokenStorage.clearTokens();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, markAsAuthenticated, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
