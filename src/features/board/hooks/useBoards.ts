/**
 * 게시판 React Query 커스텀 훅.
 *
 * boardKeys — 쿼리 캐시 키를 계층적으로 관리하는 팩토리.
 *   예: boardKeys.lists()로 무효화하면 모든 페이지의 목록 캐시가 한번에 날아간다.
 *
 * Query 훅:
 *   useBoards          — 목록 조회 (page, size별로 별도 캐시)
 *   useBoard           — 단건 상세 조회 (id가 0이면 요청하지 않음)
 *   useBoardCategories — 카테고리 맵 조회 (거의 안 바뀌므로 캐시 무기한 유지)
 *
 * Mutation 훅:
 *   useCreateBoard — 생성 성공 시 목록 캐시 무효화
 *   useUpdateBoard — 수정 성공 시 목록 + 해당 상세 캐시 무효화
 *   useDeleteBoard — 삭제 성공 시 목록 캐시 무효화
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardApi } from "../api";
import type {
  CreateBoardRequest,
  UpdateBoardRequest,
  PaginationParams,
} from "../types";

/**
 * React Query 캐시 키 팩토리.
 * 계층 구조 덕분에 상위 키(예: lists())로 하위 키(예: list({page:0}))를 한번에 무효화할 수 있다.
 */
export const boardKeys = {
  all: ["boards"] as const,
  lists: () => [...boardKeys.all, "list"] as const,
  list: (params: PaginationParams) => [...boardKeys.lists(), params] as const,
  details: () => [...boardKeys.all, "detail"] as const,
  detail: (id: number) => [...boardKeys.details(), id] as const,
  categories: () => [...boardKeys.all, "categories"] as const,
};

export const useBoards = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: boardKeys.list(params),
    queryFn: () => boardApi.getBoards(params),
  });
};

export const useBoard = (id: number) => {
  return useQuery({
    queryKey: boardKeys.detail(id),
    queryFn: () => boardApi.getBoard(id),
    enabled: !!id, // id가 0이거나 falsy이면 요청을 보내지 않음
  });
};

export const useBoardCategories = () => {
  return useQuery({
    queryKey: boardKeys.categories(),
    queryFn: () => boardApi.getCategories(),
    staleTime: Infinity, // 카테고리는 거의 변하지 않으므로 한번 받으면 계속 캐시 사용
  });
};

export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBoardRequest) => boardApi.createBoard(data),
    onSuccess: () => {
      // 새 글이 추가되었으므로 목록 캐시를 무효화하여 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBoardRequest }) =>
      boardApi.updateBoard(id, data),
    onSuccess: (_, { id }) => {
      // 목록의 제목 등이 바뀔 수 있으므로 목록 캐시도 함께 무효화
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(id) });
    },
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => boardApi.deleteBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
};
