/**
 * React Query 전역 설정.
 * main.tsx에서 QueryClientProvider에 주입하여 앱 전체에서 공유한다.
 *
 * - staleTime 5분: 한번 받아온 데이터를 5분간 신선한 것으로 취급 (불필요한 재요청 방지)
 * - retry 1회: 요청 실패 시 1번만 재시도
 * - refetchOnWindowFocus 비활성화: 브라우저 탭을 왔다갔다 해도 자동 재요청 안 함
 */
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
