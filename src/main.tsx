/**
 * 앱 엔트리포인트.
 *
 * Provider 래핑 순서:
 * StrictMode → QueryClientProvider → BrowserRouter → AuthProvider → ThemeModeProvider → GlobalStyle → App
 *
 * QueryClient가 가장 바깥에 있어야 인증 관련 쿼리도 사용할 수 있고,
 * BrowserRouter가 AuthProvider보다 먼저 감싸야 내부에서 useNavigate를 쓸 수 있다.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from './shared/api';
import { AuthProvider } from './features/auth/context/AuthContext';
import { ThemeModeProvider, GlobalStyle } from './shared/styles';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeModeProvider>
            <GlobalStyle />
            <App />
          </ThemeModeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
