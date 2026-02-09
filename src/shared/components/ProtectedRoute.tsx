/**
 * 라우트 보호 컴포넌트.
 *
 * ProtectedRoute: 미인증 시 /login으로 리다이렉트
 * GuestRoute: 인증 상태면 /boards로 리다이렉트 (로그인/회원가입 페이지용)
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/boards" replace />;
  return <>{children}</>;
}
