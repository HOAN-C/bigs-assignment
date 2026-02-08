/**
 * React Query 전역 QueryClient 설정
 *
 * 앱 전체에서 단일 인스턴스로 사용하며, main.tsx의 QueryClientProvider에 주입된다.
 * 기본 옵션:
 *  - staleTime 5분: 데이터를 5분간 fresh로 간주하여 불필요한 refetch를 방지
 *  - retry 1회: 네트워크 실패 시 1번만 재시도
 *  - refetchOnWindowFocus 비활성화: 탭 전환 시 자동 refetch 방지
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
