/**
 * 게시판 API 함수.
 *
 * 게시글 생성/수정 시 서버는 multipart/form-data를 요구하는데,
 * JSON 필드들(title, content, category)을 개별 필드가 아닌
 * "request"라는 하나의 JSON Blob 파트로 받는 구조다.
 * createFormData 헬퍼가 이 변환을 담당한다.
 */
import { apiClient } from "@/shared/api";
import type {
  BoardListItem,
  BoardDetail,
  BoardCategoryMap,
  CreateBoardRequest,
  CreateBoardResponse,
  UpdateBoardRequest,
  PaginatedResponse,
  PaginationParams,
} from "../types";

/**
 * 게시글 생성/수정 요청 객체를 서버가 기대하는 FormData 형식으로 변환한다.
 *
 * 서버가 JSON 데이터를 "request" 파트(application/json)로 받기 때문에,
 * 단순 문자열이 아닌 Blob으로 감싸서 Content-Type을 명시해줘야 한다.
 */
const createFormData = (
  data: CreateBoardRequest | UpdateBoardRequest,
): FormData => {
  const formData = new FormData();

  const { file, ...requestBody } = data;
  formData.append(
    "request",
    new Blob([JSON.stringify(requestBody)], { type: "application/json" }),
  );

  if (file) {
    formData.append("file", file);
  }
  return formData;
};

export const boardApi = {
  /** GET /boards — 게시글 목록 (페이지네이션) */
  getBoards: async (
    params: PaginationParams,
  ): Promise<PaginatedResponse<BoardListItem>> => {
    console.log({ params });
    const response = await apiClient.get<PaginatedResponse<BoardListItem>>(
      "/boards",
      { params },
    );
    return response.data;
  },

  /** GET /boards/:id — 게시글 상세 */
  getBoard: async (id: number): Promise<BoardDetail> => {
    const response = await apiClient.get<BoardDetail>(`/boards/${id}`);
    return response.data;
  },

  /** GET /boards/categories — 카테고리 목록 (코드→표시명 맵) */
  getCategories: async (): Promise<BoardCategoryMap> => {
    const response =
      await apiClient.get<BoardCategoryMap>("/boards/categories");
    return response.data;
  },

  /** POST /boards — 게시글 생성 */
  createBoard: async (
    data: CreateBoardRequest,
  ): Promise<CreateBoardResponse> => {
    const response = await apiClient.post<CreateBoardResponse>(
      "/boards",
      createFormData(data),
    );
    return response.data;
  },

  /** PATCH /boards/:id — 게시글 수정 */
  updateBoard: async (id: number, data: UpdateBoardRequest): Promise<void> => {
    await apiClient.patch(`/boards/${id}`, createFormData(data));
  },

  /** DELETE /boards/:id — 게시글 삭제 */
  deleteBoard: async (id: number): Promise<void> => {
    await apiClient.delete(`/boards/${id}`);
  },
};
