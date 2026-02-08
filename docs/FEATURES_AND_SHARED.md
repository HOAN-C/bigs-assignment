# 프론트엔드 구조: features & shared

`src/features`와 `src/shared` 폴더의 역할, 파일 구성, 데이터 흐름을 정리한 문서입니다.  
처음 보는 사람이 **어디에 무엇이 있고, 어떻게 연결되는지** 빠르게 이해할 수 있도록 작성했습니다.

---

## 1. 폴더 구조 한눈에 보기

```
src/
├── shared/
│   └── api/
│       ├── client.ts       # Axios 인스턴스 + Bearer 주입 + 401 시 refresh/재시도
│       ├── tokenStorage.ts # JWT 저장 (accessToken 메모리, refreshToken 쿠키)
│       ├── queryClient.ts  # React Query 전역 설정
│       └── index.ts        # 배럴: apiClient, queryClient, tokenStorage export
│
├── features/
│   ├── auth/               # 인증 (회원가입, 로그인, 로그아웃)
│   │   ├── api/index.ts    # authApi (signUp, signIn)
│   │   ├── hooks/
│   │   │   ├── useAuth.ts  # useSignUp, useSignIn, useSignOut
│   │   │   └── index.ts
│   │   ├── types/index.ts  # SignUpRequest, SignInRequest, AuthTokens
│   │   └── index.ts        # auth 전체 배럴
│   │
│   └── board/              # 게시판 (목록/상세/카테고리, CRUD)
│       ├── api/index.ts    # boardApi (getBoards, getBoard, getCategories, create/update/delete)
│       ├── hooks/
│       │   ├── useBoards.ts # boardKeys + Query/Mutation 훅
│       │   └── index.ts
│       ├── types/index.ts  # BoardCategory, BoardListItem, BoardDetail, Pagination 등
│       └── index.ts        # board 전체 배럴
│
├── App.tsx
└── main.tsx                # QueryClientProvider로 queryClient 주입
```

- **shared**: 도메인과 무관한 **공통 인프라** (HTTP 클라이언트, 토큰, React Query).
- **features**: **기능 단위** 모듈. 각 feature는 `api`(HTTP), `hooks`(React Query + 부가 로직), `types`(타입)로 나뉩니다.

---

## 2. shared/api 상세

### 2.1 `client.ts` — 공통 Axios 클라이언트

**하는 일**

1. **단일 인스턴스**: `apiClient` = baseURL(`VITE_API_BASE_URL` 또는 `http://localhost:8080`) + 기본 헤더 `Content-Type: application/json`.
2. **요청 인터셉터**: 매 요청 전 `tokenStorage.getAccessToken()`으로 accessToken을 꺼내 `Authorization: Bearer {token}` 으로 붙임.
3. **응답 인터셉터**  
   - **2xx**: 그대로 통과.  
   - **에러(예: 401)**: 아래 401 처리 로직 실행.

**401 처리 로직 (동시 요청 대비)**

- 여러 API가 동시에 401을 받으면 refresh를 한 번만 호출하고, 나머지는 **큐(failedQueue)**에 넣었다가 새 토큰으로 재시도합니다.

| 단계 | 동작 |
|------|------|
| 1 | 401이 아니거나, 이미 재시도한 요청(`_retry` 플래그) → 그대로 reject. |
| 2 | 이미 다른 요청이 refresh 중(`isRefreshing`) → 이 요청은 큐에만 넣고, refresh 끝나면 받은 토큰으로 **이 요청만** 재시도. |
| 3 | 이 요청이 **첫 401** → 이 요청이 refresh 수행. `originalRequest._retry = true`, `isRefreshing = true` 설정. |
| 4 | refreshToken 없음 → `clearTokens()`, reject. |
| 5 | **기본 axios**로 `POST {baseURL}/auth/refresh` (body: `{ refreshToken }`, 헤더: Bearer 기존 accessToken).  
      → `apiClient`를 쓰면 인터셉터가 다시 타서 무한 루프 위험이라 별도 axios 사용. |
| 6 | 성공 → `setTokens(accessToken, newRefreshToken)`, `processQueue(null, accessToken)` 로 큐에 쌓인 요청들에 새 토큰 전달, 원래 요청도 새 토큰으로 재시도. |
| 7 | 실패 → `processQueue(refreshError, null)`, `clearTokens()`, reject. |
| 8 | `finally`에서 `isRefreshing = false`. |

---

### 2.2 `tokenStorage.ts` — JWT 저장소

| 저장소 | 저장 위치 | 설명 |
|--------|-----------|------|
| **accessToken** | **메모리** (클로저 변수 `accessTokenInMemory`) | 새로고침 시 사라짐. XSS로 DOM에서 직접 읽기 어렵게 하기 위함. 401 시 refresh로 재발급. |
| **refreshToken** | **쿠키** (js-cookie, `Secure`, `SameSite: strict`, 7일) | CSRF 완화. 서버에서 HttpOnly 쿠키를 쓸 수 없을 때의 차선책. |

**제공 API**

- `getAccessToken()` / `getRefreshToken()` — 조회.
- `setTokens(accessToken, refreshToken)` — 로그인/refresh 성공 시.
- `clearTokens()` — 로그아웃 또는 refresh 실패 시.
- `hasTokens()` — refreshToken 쿠키 존재 여부로 로그인 여부 판단.

---

### 2.3 `queryClient.ts` — React Query 전역 설정

- 앱 전체에서 **단일 QueryClient** 사용.
- `main.tsx`에서 `QueryClientProvider`로 주입.
- 기본값: `staleTime` 5분, `retry` 1회, `refetchOnWindowFocus` false.

---

### 2.4 `index.ts` — 배럴

- `apiClient`, `queryClient`, `tokenStorage`를 re-export.
- 사용처에서는 `@/shared/api`에서만 가져오면 됨.

---

## 3. features/auth — 인증

**역할**: 회원가입, 로그인, 로그아웃.

### 3.1 파일별 역할

| 경로 | 역할 |
|------|------|
| **api/index.ts** | `authApi.signUp(data)`, `authApi.signIn(data)`. 순수 HTTP만. 토큰 저장은 하지 않음. |
| **hooks/useAuth.ts** | `useSignUp`, `useSignIn`, `useSignOut`. 로그인 성공 시 `tokenStorage.setTokens()` 호출은 여기서 수행. |
| **types/index.ts** | `SignUpRequest`, `SignInRequest`, `AuthTokens`. |

### 3.2 API vs 훅 책임

- **API**: `POST /auth/signup`, `POST /auth/signin` 호출 및 응답 반환만.
- **훅**: `useSignIn`의 `onSuccess`에서 `tokenStorage.setTokens(data.accessToken, data.refreshToken)` 호출.  
  → “토큰을 어디에 저장할지”는 API가 아니라 클라이언트(훅) 책임.

### 3.3 타입

- **SignUpRequest**: `username`, `name`, `password`, `confirmPassword`
- **SignInRequest**: `username`, `password`
- **AuthTokens**: `accessToken`, `refreshToken` (signin/refresh 응답 공통)

### 3.4 사용 예

```ts
import { useSignIn, useSignOut } from '@/features/auth';

const signInMutation = useSignIn();
signInMutation.mutate({ username, password });

const signOut = useSignOut();
signOut(); // 호출 시 토큰만 삭제 (서버 로그아웃 API 없음)
```

---

## 4. features/board — 게시판

**역할**: 게시글 목록/상세/카테고리 조회, 생성/수정/삭제.

### 4.1 파일별 역할

| 경로 | 역할 |
|------|------|
| **api/index.ts** | `boardApi`: getBoards, getBoard, getCategories, createBoard, updateBoard, deleteBoard. 생성/수정은 `createFormData()`로 FormData 변환 후 전송. FormData 시 `Content-Type`은 명시하지 않음(axios가 boundary 포함해 자동 설정). |
| **hooks/useBoards.ts** | `boardKeys`(쿼리 키 팩토리) + Query 훅 3개 + Mutation 훅 3개. Mutation 성공 시 관련 쿼리 무효화. |
| **types/index.ts** | Board 도메인 타입 + 페이지네이션 타입. |

### 4.2 API 엔드포인트 요약

| 메서드 | 용도 | 비고 |
|--------|------|------|
| GET /boards | 목록 (페이지네이션) | `params`: page, size |
| GET /boards/:id | 단건 상세 | |
| GET /boards/categories | 카테고리 목록 | NOTICE, FREE, QNA, ETC |
| POST /boards | 생성 | FormData (title, content, category, file?) |
| PATCH /boards/:id | 수정 | FormData |
| DELETE /boards/:id | 삭제 | |

### 4.3 쿼리 키 계층 (boardKeys)

캐시를 계층으로 두어, 무효화 시 “목록만 / 상세만 / 카테고리만” 선택 가능.

- `boardKeys.all` → `['boards']`
- `boardKeys.lists()` → `['boards', 'list']`
- `boardKeys.list(params)` → `['boards', 'list', params]` (목록용)
- `boardKeys.details()` → `['boards', 'detail']`
- `boardKeys.detail(id)` → `['boards', 'detail', id]` (상세용)
- `boardKeys.categories()` → `['boards', 'categories']`

예: `invalidateQueries({ queryKey: boardKeys.lists() })` → 목록 관련만 무효화.

### 4.4 훅 정리

| 훅 | 용도 | 비고 |
|----|------|------|
| useBoards(params?) | 목록 조회 | page/size별 별도 캐시 |
| useBoard(id) | 단건 상세 | `enabled: !!id` |
| useBoardCategories() | 카테고리 목록 | `staleTime: Infinity` |
| useCreateBoard() | 생성 | 성공 시 목록 무효화 |
| useUpdateBoard() | 수정 | 성공 시 목록 + 해당 상세 무효화 |
| useDeleteBoard() | 삭제 | 성공 시 목록 무효화 |

### 4.5 타입 요약

- **BoardCategory**: `'NOTICE' | 'FREE' | 'QNA' | 'ETC'`
- **PaginationParams**: `page?`, `size?`
- **PaginatedResponse\<T\>**: `content`, `totalPages`, `totalElements`, `number`, `size`, `first`, `last`, `empty`
- **BoardListItem**: id, title, category, createdAt
- **BoardDetail**: id, title, content, boardCategory, imageUrl, createdAt
- **CreateBoardRequest / UpdateBoardRequest**: title, content, category, file?

### 4.6 사용 예

```ts
import {
  useBoards,
  useBoard,
  useBoardCategories,
  useCreateBoard,
  boardKeys,
} from '@/features/board';

const { data } = useBoards({ page: 0, size: 10 });
const { data: detail } = useBoard(1);
const { data: categories } = useBoardCategories();

const createMutation = useCreateBoard();
createMutation.mutate({ title, content, category: 'FREE' });
```

---

## 5. 배럴 파일(index.ts) 역할

- 각 폴더의 **진입점**을 하나로 만듦.
- 예: `import { useSignIn, authApi } from '@/features/auth'` — 폴더 경로만 알면 되고, 내부 파일명(useAuth.ts, api/index.ts)을 알 필요 없음.
- feature 루트 `index.ts`는 `api`, `hooks`, `types`를 `export *`로 재내보냄.

---

## 6. import 규칙

- **shared**: `@/shared/api` → apiClient, queryClient, tokenStorage.
- **feature 사용**: `@/features/auth`, `@/features/board`에서 훅/API/타입 import.
- **feature 내부**: 같은 feature 안에서는 `../types`, `../api` 등 **상대 경로** 사용.

---

## 7. 앱 진입점 (main.tsx)

- `QueryClientProvider`에 `queryClient`(shared/api) 주입.
- 그 안에 `App` 렌더링.
- 따라서 모든 feature 훅은 동일한 QueryClient를 사용함.

---

이 문서는 현재 코드 기준으로 작성되었습니다. API 스펙이나 폴더 구조가 바뀌면 문서도 함께 수정하는 것을 권장합니다.
