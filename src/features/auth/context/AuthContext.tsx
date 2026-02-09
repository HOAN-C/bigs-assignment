/**
 * 인증 상태를 앱 전역에서 공유하는 Provider 컴포넌트.
 *
 * 모든 인증 상태 변경은 tokenStorage를 통해 이루어진다:
 *   setTokens()  → onAuthChange(true)  → 로그인 상태로 전환
 *   clearTokens() → onAuthChange(false) → 로그아웃 + /login 리다이렉트
 *
 * 컴포넌트에서 직접 setIsAuthenticated를 호출할 필요가 없다.
 * tokenStorage의 onAuthChange 콜백 하나로 인터셉터·훅·UI 상태가 모두 동기화된다.
 */
import { useState, useCallback, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { tokenStorage } from "@/shared/api";
import { AuthContext } from "./authContextDef";

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    tokenStorage.hasTokens(),
  );

  /**
   * tokenStorage의 변경 사항을 React 상태에 동기화한다.
   * setTokens/clearTokens가 호출될 때마다 이 콜백이 실행된다.
   * 인증 해제 시 /login으로 리다이렉트한다.
   */
  useEffect(() => {
    tokenStorage.onAuthChange = (authenticated: boolean) => {
      setIsAuthenticated(authenticated);
      if (!authenticated) {
        navigate("/login", { replace: true });
      }
    };
    return () => {
      tokenStorage.onAuthChange = null;
    };
  }, [navigate]);

  /** clearTokens() → onAuthChange(false)가 상태 갱신과 리다이렉트를 모두 처리한다 */
  const signOut = useCallback(() => {
    tokenStorage.clearTokens();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
