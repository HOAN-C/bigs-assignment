/**
 * 카테고리 코드와 표시명의 매핑.
 * 서버가 { "NOTICE": "공지", "FREE": "자유", "QNA": "Q&A", "ETC": "기타" } 형태로 내려준다.
 * 키(코드)는 게시글 생성/수정 시 category 필드에, 값(표시명)은 UI에 렌더링할 때 사용한다.
 */
export type BoardCategoryMap = Record<string, string>;

/** GET /boards 요청 시 전달하는 페이지네이션 파라미터 */
export interface PaginationParams {
  /** 요청할 페이지 번호 (0부터 시작) */
  page?: number;
  /** 한 페이지에 가져올 항목 수 */
  size?: number;
}

/** 정렬 상태 정보 (Spring Data 표준) */
export interface Sort {
  unsorted: boolean;
  sorted: boolean;
  empty: boolean;
}

/** 페이지 메타데이터 (Spring Data Pageable) */
export interface Pageable {
  /** 현재 페이지 번호 (0부터 시작) */
  pageNumber: number;
  /** 한 페이지당 항목 수 */
  pageSize: number;
  sort: Sort;
  /** 전체 데이터 중 현재 페이지의 시작 인덱스 */
  offset: number;
  unpaged: boolean;
  paged: boolean;
}

/**
 * Spring Data Page 형태의 페이지네이션 응답.
 * 제네릭 T에 실제 아이템 타입(예: BoardListItem)을 넣어 사용한다.
 */
export interface PaginatedResponse<T> {
  /** 현재 페이지의 데이터 목록 */
  content: T[];
  pageable: Pageable;
  /** 전체 페이지 수 */
  totalPages: number;
  /** DB 전체 데이터 수 */
  totalElements: number;
  /** 마지막 페이지 여부 */
  last: boolean;
  /** 현재 페이지의 실제 항목 수 (마지막 페이지에서는 size보다 작을 수 있음) */
  numberOfElements: number;
  /** 요청한 페이지 크기 */
  size: number;
  /** 현재 페이지 번호 (0부터 시작) */
  number: number;
  sort: Sort;
  /** 첫 번째 페이지 여부 */
  first: boolean;
  /** content가 비어있으면 true */
  empty: boolean;
}

/** GET /boards 목록 응답의 각 항목 */
export interface BoardListItem {
  id: number;
  title: string;
  /** 카테고리 코드 (BoardCategoryMap의 key에 해당, 예: "NOTICE") */
  category: string;
  createdAt: string;
}

/** GET /boards/:id 상세 응답 */
export interface BoardDetail {
  id: number;
  title: string;
  content: string;
  /**
   * 카테고리 코드.
   * 주의: 목록 응답에서는 "category"인데 상세 응답에서는 "boardCategory"로 필드명이 다르다.
   */
  boardCategory: string;
  /** 첨부 이미지 URL (없으면 null) */
  imageUrl: string | null;
  createdAt: string;
}

/** POST /boards 요청 body (내부적으로 FormData로 변환하여 전송) */
export interface CreateBoardRequest {
  title: string;
  content: string;
  category: string;
  /** 첨부 파일 (선택) */
  file?: File;
}

/** POST /boards 성공 응답 */
export interface CreateBoardResponse {
  /** 생성된 게시글의 ID */
  id: number;
}

/** PATCH /boards/:id 요청 body (내부적으로 FormData로 변환하여 전송) */
export interface UpdateBoardRequest {
  title: string;
  content: string;
  category: string;
  /** 첨부 파일 (선택) */
  file?: File;
}
