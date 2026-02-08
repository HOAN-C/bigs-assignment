// 게시판 카테고리 리터럴 타입 (GET /boards/categories 응답값과 동일)
export type BoardCategory = 'NOTICE' | 'FREE' | 'QNA' | 'ETC';

// 목록 API 공통: 페이지네이션 쿼리 파라미터 (GET /boards?page&size)
export interface PaginationParams {
  page?: number;
  size?: number;
}

// 목록 API 공통: Spring Data Page 스타일 응답 (GET /boards 응답 형태)
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 게시글 목록 한 건의 타입 (GET /boards 응답의 content[i])
export interface BoardListItem {
  id: number;
  title: string;
  category: BoardCategory;
  createdAt: string; // ISO 8601 형식 문자열
}

// 게시글 상세 타입 (GET /boards/:id 응답)
export interface BoardDetail {
  id: number;
  title: string;
  content: string;
  boardCategory: BoardCategory; // 목록의 category와 필드명이 다름에 주의
  imageUrl: string | null;      // 첨부 이미지 URL (없으면 null)
  createdAt: string;
}

// 게시글 생성 요청 타입 (POST /boards, FormData로 전송)
export interface CreateBoardRequest {
  title: string;
  content: string;
  category: BoardCategory;
  file?: File; // 첨부 파일 (선택)
}

// 게시글 수정 요청 타입 (PATCH /boards/:id, FormData로 전송)
export interface UpdateBoardRequest {
  title: string;
  content: string;
  category: BoardCategory;
  file?: File; // 첨부 파일 (선택)
}
