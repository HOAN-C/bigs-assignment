/**
 * 게시판 React Query 커스텀 훅 모음
 *
 * boardKeys: 쿼리 키를 계층적으로 관리하는 팩토리 객체.
 *  - all → lists/details/categories 순으로 구체화.
 *  - invalidateQueries 시 상위 키로 한번에 무효화할 수 있다.
 *
 * Query 훅:
 *  - useBoards: 목록 조회 (page, size별 별도 캐시)
 *  - useBoard: 단건 상세 조회 (id가 있을 때만 활성화)
 *  - useBoardCategories: 카테고리 목록 (변경이 거의 없어 staleTime=Infinity)
 *
 * Mutation 훅:
 *  - useCreateBoard: 생성 후 목록 캐시 무효화
 *  - useUpdateBoard: 수정 후 목록 + 해당 상세 캐시 무효화
 *  - useDeleteBoard: 삭제 후 목록 캐시 무효화
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardApi } from '../api';
import type { CreateBoardRequest, UpdateBoardRequest, PaginationParams } from '../types';

// 쿼리 키 팩토리: 계층 구조로 캐시 키를 생성하여 선택적 무효화를 쉽게 한다
export const boardKeys = {
  all: ['boards'] as const,
  lists: () => [...boardKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...boardKeys.lists(), params] as const,
  details: () => [...boardKeys.all, 'detail'] as const,
  detail: (id: number) => [...boardKeys.details(), id] as const,
  categories: () => [...boardKeys.all, 'categories'] as const,
};

// 게시글 목록 조회 훅 (page, size 파라미터에 따라 개별 캐시)
export const useBoards = (params?: PaginationParams) => {
  return useQuery({
    queryKey: boardKeys.list(params ?? {}),
    queryFn: () => boardApi.getBoards(params),
  });
};

// 게시글 단건 상세 조회 훅 (id가 falsy이면 쿼리 비활성화)
export const useBoard = (id: number) => {
  return useQuery({
    queryKey: boardKeys.detail(id),
    queryFn: () => boardApi.getBoard(id),
    enabled: !!id,
  });
};

// 카테고리 목록 조회 훅 (거의 변하지 않으므로 무기한 캐시)
export const useBoardCategories = () => {
  return useQuery({
    queryKey: boardKeys.categories(),
    queryFn: () => boardApi.getCategories(),
    staleTime: Infinity,
  });
};

// 게시글 생성 mutation 훅: 성공 시 목록 쿼리를 무효화하여 자동 refetch 유도
export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBoardRequest) => boardApi.createBoard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
};

// 게시글 수정 mutation 훅: 성공 시 목록과 해당 상세 쿼리 모두 무효화
export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBoardRequest }) =>
      boardApi.updateBoard(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(id) });
    },
  });
};

// 게시글 삭제 mutation 훅: 성공 시 목록 쿼리 무효화
export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => boardApi.deleteBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
};
