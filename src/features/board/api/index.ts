/**
 * 게시판 API 호출 함수 모음
 *
 * - 목록 조회 (GET /boards?page&size): 페이지네이션 적용
 * - 단건 조회 (GET /boards/:id): 상세 정보 반환
 * - 카테고리 조회 (GET /boards/categories): NOTICE, FREE, QNA, ETC
 * - 생성 (POST /boards): multipart/form-data, 파일 첨부 가능
 * - 수정 (PATCH /boards/:id): multipart/form-data, 파일 첨부 가능
 * - 삭제 (DELETE /boards/:id)
 *
 * 생성/수정 시 createFormData 헬퍼로 객체를 FormData로 변환한다.
 */
import { apiClient } from '@/shared/api';
import type {
  BoardListItem,
  BoardDetail,
  BoardCategory,
  CreateBoardRequest,
  UpdateBoardRequest,
  PaginatedResponse,
  PaginationParams,
} from '../types';

// 생성/수정 요청 객체를 multipart/form-data용 FormData로 변환하는 헬퍼
const createFormData = (data: CreateBoardRequest | UpdateBoardRequest): FormData => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('content', data.content);
  formData.append('category', data.category);
  if (data.file) {
    formData.append('file', data.file);
  }
  return formData;
};

export const boardApi = {
  // 게시글 목록 조회 (페이지네이션)
  getBoards: async (params?: PaginationParams): Promise<PaginatedResponse<BoardListItem>> => {
    const response = await apiClient.get<PaginatedResponse<BoardListItem>>('/boards', { params });
    return response.data;
  },

  // 게시글 단건 상세 조회
  getBoard: async (id: number): Promise<BoardDetail> => {
    const response = await apiClient.get<BoardDetail>(`/boards/${id}`);
    return response.data;
  },

  // 카테고리 목록 조회
  getCategories: async (): Promise<BoardCategory[]> => {
    const response = await apiClient.get<BoardCategory[]>('/boards/categories');
    return response.data;
  },

  // 게시글 생성 (FormData로 전송, axios가 Content-Type을 boundary 포함하여 자동 설정)
  createBoard: async (data: CreateBoardRequest): Promise<void> => {
    await apiClient.post('/boards', createFormData(data));
  },

  // 게시글 수정 (FormData로 전송)
  updateBoard: async (id: number, data: UpdateBoardRequest): Promise<void> => {
    await apiClient.patch(`/boards/${id}`, createFormData(data));
  },

  // 게시글 삭제
  deleteBoard: async (id: number): Promise<void> => {
    await apiClient.delete(`/boards/${id}`);
  },
};
