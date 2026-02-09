# Bigs Board

React + TypeScript 기반 게시판 웹 애플리케이션.
JWT 인증, 게시글 CRUD, 다크모드, 반응형 레이아웃을 지원한다.

---

## 목차

1. [기술 스택](#기술-스택)
2. [시작하기](#시작하기)
3. [폴더 구조](#폴더-구조)
4. [아키텍처 개요](#아키텍처-개요)
5. [라우팅 구조](#라우팅-구조)
6. [인증 시스템](#인증-시스템)
7. [API 구조](#api-구조)
8. [상태 관리](#상태-관리)
9. [게시판 기능](#게시판-기능)
10. [컴포넌트 설계](#컴포넌트-설계)
11. [스타일링 & 테마](#스타일링--테마)
12. [새로운 기능 추가 가이드](#새로운-기능-추가-가이드)
13. [주의사항](#주의사항)

---

## 기술 스택

| 분류      | 기술                  | 역할                      |
| --------- | --------------------- | ------------------------- |
| UI        | React 19              | 컴포넌트 기반 UI          |
| 언어      | TypeScript (strict)   | 정적 타입 검사            |
| 빌드      | Vite 7                | 개발 서버 & 번들링        |
| 스타일    | styled-components     | CSS-in-JS                 |
| HTTP      | axios                 | API 통신                  |
| 서버 상태 | @tanstack/react-query | 캐싱, 자동 갱신, mutation |
| 라우팅    | react-router-dom      | 클라이언트 사이드 라우팅  |
| 쿠키      | js-cookie             | refreshToken 쿠키 관리    |

---

## 시작하기

### 필수 환경

- Node.js 18 이상
- npm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 린트 검사
npm run lint
```

### 환경 변수

프로젝트 루트의 `.env` 파일:

```
VITE_API_BASE_URL=https://front-mission.bigs.or.kr
```

`VITE_` 접두사가 붙은 변수만 클라이언트 코드에서 `import.meta.env.VITE_API_BASE_URL`로 접근할 수 있다.

---

## 폴더 구조

```
src/
├── main.tsx                        # 엔트리포인트 (Provider 트리 구성)
├── App.tsx                         # 라우트 정의
│
├── features/                       # 기능(도메인) 단위 모듈
│   ├── auth/                       # 인증 기능
│   │   ├── api/index.ts            #   signUp, signIn API 함수
│   │   ├── context/
│   │   │   ├── authContextDef.ts   #   Context 타입 정의
│   │   │   ├── AuthContext.tsx     #   AuthProvider 컴포넌트
│   │   │   └── useAuth.ts         #   useAuth 훅 (Context 소비)
│   │   ├── hooks/useAuth.ts        #   useSignUp, useSignIn 뮤테이션 훅 (로그아웃은 AuthContext.signOut 사용)
│   │   └── types/index.ts          #   SignUpRequest, SignInRequest 등
│   │
│   └── board/                      # 게시판 기능
│       ├── api/index.ts            #   게시글 CRUD API 함수
│       ├── hooks/useBoards.ts      #   React Query 훅 + 캐시 키 팩토리
│       └── types/index.ts          #   BoardDetail, PaginatedResponse 등
│
├── pages/                          # 페이지 컴포넌트 (라우트 1:1 매핑)
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── BoardListPage.tsx
│   ├── BoardDetailPage.tsx
│   ├── BoardFormPage.tsx           #   게시글 생성/수정 통합
│   └── index.ts                    #   배럴 export
│
└── shared/                         # 공유 유틸리티
    ├── api/
    │   ├── client.ts               #   axios 인스턴스 + 인터셉터
    │   ├── tokenStorage.ts         #   JWT 토큰 저장/관리
    │   ├── queryClient.ts          #   React Query 전역 설정
    │   └── index.ts
    ├── components/                 #   재사용 UI 컴포넌트
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   ├── Textarea.tsx
    │   ├── Select.tsx
    │   ├── FileUpload.tsx
    │   ├── CategoryBadge.tsx
    │   ├── CategoryTabs.tsx
    │   ├── Pagination.tsx
    │   ├── NavHeader.tsx
    │   ├── MobileNavHeader.tsx
    │   ├── BackLink.tsx
    │   ├── ProtectedRoute.tsx
    │   └── index.ts
    └── styles/
        ├── theme.ts                #   Light/Dark 테마 토큰
        ├── GlobalStyle.ts          #   CSS 리셋 + 전역 스타일
        ├── ThemeContext.tsx         #   다크모드 토글 Context
        └── styled.d.ts             #   styled-components 타입 확장
```

### 설계 원칙

- **기능 기반 폴더 구조**: `features/auth/`, `features/board/` 처럼 도메인 단위로 코드를 묶는다
- **API와 UI 분리**: API 호출(`api/`)은 컴포넌트에서 직접 하지 않고, 커스텀 훅(`hooks/`)을 통해서만 접근한다
- **배럴 export**: 각 폴더의 `index.ts`에서 re-export하여 import 경로를 단순화한다

---

## 아키텍처 개요

### Provider 트리 (`main.tsx`)

앱이 실행되면 아래 순서로 Provider가 감싸진다:

```tsx
<StrictMode>
  <QueryClientProvider>
    {/* React Query 캐시 */}
    <BrowserRouter>
      {/* 클라이언트 라우팅 */}
      <AuthProvider>
        {/* 인증 상태 관리 */}
        <ThemeModeProvider>
          {/* 다크모드 상태 */}
          <GlobalStyle /> {/* CSS 리셋 */}
          <App /> {/* 라우트 정의 */}
        </ThemeModeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
</StrictMode>
```

각 Provider의 역할:

| Provider              | 역할                                                         |
| --------------------- | ------------------------------------------------------------ |
| `QueryClientProvider` | React Query의 캐시 저장소를 앱 전체에 공유                   |
| `BrowserRouter`       | URL 기반 클라이언트 사이드 라우팅 활성화                     |
| `AuthProvider`        | `isAuthenticated` 상태 관리, 토큰 변경 감지 시 자동 로그아웃 |
| `ThemeModeProvider`   | light/dark 테마 전환, localStorage에 설정 저장               |

### 데이터 흐름 요약

```
[사용자 조작]
    ↓
[페이지 컴포넌트]  →  커스텀 훅(useBoards 등) 호출
    ↓
[React Query]      →  캐시 확인 → 없으면 API 함수 호출
    ↓
[API 함수]         →  boardApi.getBoards() 등
    ↓
[apiClient]        →  공유 axios 인스턴스 (인터셉터가 토큰 부착)
    ↓
[서버 응답]        →  React Query가 캐시에 저장 → 컴포넌트 리렌더
```

---

## 라우팅 구조

`src/App.tsx`에 정의된 라우트:

| 경로               | 페이지          | 접근 제어        | 설명                              |
| ------------------ | --------------- | ---------------- | --------------------------------- |
| `/`                | -               | -                | `/boards`로 리다이렉트            |
| `/login`           | LoginPage       | `GuestRoute`     | 로그인 (인증 시 `/boards`로 이동) |
| `/signup`          | SignupPage      | `GuestRoute`     | 회원가입                          |
| `/boards`          | BoardListPage   | `ProtectedRoute` | 게시글 목록                       |
| `/boards/new`      | BoardFormPage   | `ProtectedRoute` | 게시글 작성                       |
| `/boards/:id`      | BoardDetailPage | 없음             | 게시글 상세                       |
| `/boards/:id/edit` | BoardFormPage   | `ProtectedRoute` | 게시글 수정                       |

### 라우트 가드

```tsx
// src/shared/components/ProtectedRoute.tsx

// 로그인하지 않으면 /login으로 리다이렉트
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// 이미 로그인했으면 /boards로 리다이렉트 (로그인/회원가입 페이지 재접근 방지)
export function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/boards" replace />;
  return <>{children}</>;
}
```

---

## 인증 시스템

### 토큰 저장 방식

```
┌──────────────────────────────────────────────────────┐
│ accessToken                                          │
│ ・저장 위치: JavaScript 메모리 (변수)                    │
│ ・장점: XSS 공격에 안전 (DOM에서 접근 불가)               │
│ ・단점: 새로고침하면 사라짐 → refreshToken으로 재발급      │
├──────────────────────────────────────────────────────┤
│ refreshToken                                         │
│ ・저장 위치: 쿠키 (js-cookie)                           │
│ ・보안 설정: Secure + SameSite=Strict                  │
│ ・만료: 7일                                            │
│ ・역할: accessToken 만료 시 새 토큰 쌍을 발급받는 데 사용  │
└──────────────────────────────────────────────────────┘
```

`src/shared/api/tokenStorage.ts`에서 관리한다:

```typescript
export const tokenStorage = {
  // AuthContext가 등록하는 콜백. 토큰 변경 시 React 상태를 동기화한다.
  onAuthChange: null as ((authenticated: boolean) => void) | null,

  getAccessToken()                              // 메모리에서 반환
  getRefreshToken()                             // 쿠키에서 반환
  setTokens(accessToken, refreshToken)          // 둘 다 저장 + onAuthChange(true)
  clearTokens()                                 // 둘 다 삭제 + onAuthChange(false)
  hasTokens(): boolean                          // refreshToken 쿠키 존재 여부
};
```

### 로그인 흐름

```
1. 사용자가 LoginPage에서 username/password 입력 후 "Sign In" 클릭
2. useSignIn() 뮤테이션이 POST /auth/signin 요청
3. 서버 응답: { accessToken, refreshToken }
4. useSignIn의 onSuccess에서 tokenStorage.setTokens() 호출
5. setTokens()이 onAuthChange(true)를 트리거 → AuthContext가 isAuthenticated = true로 갱신
6. LoginPage의 onSuccess에서 navigate("/boards")로 이동
```

### 로그아웃 흐름

```
1. 사용자가 NavHeader에서 "Sign Out" 클릭
2. AuthContext.signOut() → tokenStorage.clearTokens() 호출
3. clearTokens()가 onAuthChange(false)를 트리거:
   ・AuthContext가 isAuthenticated = false로 갱신
   ・navigate("/login", { replace: true }) 실행
```

### 토큰 자동 갱신 흐름

```
1. API 요청 시 accessToken이 만료되어 서버가 401/403 응답
2. 응답 인터셉터가 이를 감지
3. refreshToken으로 POST /auth/refresh 호출
4. 성공 시:
   ・새 토큰 쌍 저장 (setTokens → onAuthChange(true))
   ・실패했던 원래 요청을 새 토큰으로 재시도
5. 실패 시 (refreshToken도 만료):
   ・clearTokens() → onAuthChange(false) → navigate("/login")
```

### 인증 상태 동기화 구조

모든 인증 상태 변경은 `tokenStorage`를 단일 진입점으로 사용한다:

```
tokenStorage.setTokens()  → onAuthChange(true)  → setIsAuthenticated(true)
tokenStorage.clearTokens() → onAuthChange(false) → setIsAuthenticated(false) + navigate("/login")
```

컴포넌트에서 직접 `setIsAuthenticated`를 호출하지 않는다. `tokenStorage`의 `onAuthChange` 콜백 하나로 인터셉터·훅·UI 상태가 모두 동기화된다.

### AuthContext (`src/features/auth/context/AuthContext.tsx`)

인증 상태를 앱 전체에서 공유하는 Context:

```typescript
interface AuthContextValue {
  isAuthenticated: boolean; // 현재 로그인 상태
  signOut: () => void; // 로그아웃 (clearTokens → onAuthChange가 모두 처리)
}
```

- 앱 시작 시 `tokenStorage.hasTokens()`로 초기 인증 상태 판별
- `tokenStorage.onAuthChange` 콜백을 등록하여, 토큰 변경 시 React 상태에 즉시 반영
- 인증 해제 시(`onAuthChange(false)`) 자동으로 `/login`으로 리다이렉트

---

## API 구조

### axios 인스턴스 (`src/shared/api/client.ts`)

앱 전체에서 하나의 axios 인스턴스(`apiClient`)를 공유한다:

```typescript
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
```

### 요청 인터셉터

모든 요청 직전에 실행되어 accessToken을 헤더에 자동 부착한다:

```typescript
apiClient.interceptors.request.use(async (config) => {
  let accessToken = tokenStorage.getAccessToken();

  // 새로고침 직후: accessToken은 사라졌지만 refreshToken(쿠키)은 남아있는 경우
  // → 요청 전에 미리 토큰을 갱신한다
  if (!accessToken && tokenStorage.getRefreshToken()) {
    try {
      accessToken = await refreshAccessToken();
    } catch {
      // 갱신 실패 → clearTokens가 onAuthChange를 통해 리다이렉트 처리
      tokenStorage.clearTokens();
      return Promise.reject(new Error("Authentication required"));
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
```

### 응답 인터셉터

401/403 응답 시 토큰을 자동 갱신하고 실패한 요청을 재시도한다:

```
[401/403 발생]
    ↓
갱신 중인 요청이 이미 있는가?
├── YES → 이 요청을 대기 큐(failedQueue)에 추가, 갱신 완료 대기
└── NO  → 토큰 갱신 시작
           ├── refreshToken 없음 → clearTokens() (onAuthChange가 /login 리다이렉트)
           └── refreshToken 있음 → POST /auth/refresh
                ├── 성공 → 새 토큰 저장, 대기 큐 재시도, 원래 요청 재시도
                └── 실패 → 대기 큐 전체 실패, clearTokens() (onAuthChange가 /login 리다이렉트)
```

핵심 포인트:

- **중복 갱신 방지**: `isRefreshing` 플래그와 `pendingRefreshPromise`로 동시에 여러 갱신 요청이 발생하지 않도록 한다
- **큐 기반 동시 요청 처리**: 갱신 중 들어온 다른 401 요청은 큐에 쌓아뒀다가 갱신 완료 후 일괄 재시도
- **무한 루프 방지**: `_retry` 플래그로 이미 재시도한 요청은 다시 처리하지 않음
- **인터셉터 분리**: 토큰 갱신 요청은 `apiClient`가 아닌 기본 `axios`를 사용하여 인터셉터 무한루프를 방지

### API 엔드포인트

#### 인증 API (`src/features/auth/api/index.ts`)

| 메서드 | 경로            | 설명                                     |
| ------ | --------------- | ---------------------------------------- |
| `POST` | `/auth/signup`  | 회원가입                                 |
| `POST` | `/auth/signin`  | 로그인 → `{ accessToken, refreshToken }` |
| `POST` | `/auth/refresh` | 토큰 갱신 (인터셉터에서 자동 호출)       |

#### 게시판 API (`src/features/board/api/index.ts`)

| 메서드   | 경로                     | 설명                       |
| -------- | ------------------------ | -------------------------- |
| `GET`    | `/boards?page=0&size=10` | 게시글 목록 (페이지네이션) |
| `GET`    | `/boards/:id`            | 게시글 상세                |
| `GET`    | `/boards/categories`     | 카테고리 목록              |
| `POST`   | `/boards`                | 게시글 생성 (FormData)     |
| `PATCH`  | `/boards/:id`            | 게시글 수정 (FormData)     |
| `DELETE` | `/boards/:id`            | 게시글 삭제                |

#### FormData 변환 방식

게시글 생성/수정 시 서버는 JSON 필드를 `"request"`라는 이름의 JSON Blob 파트로 받는다:

```typescript
const createFormData = (data) => {
  const formData = new FormData();
  const { file, ...requestBody } = data;

  // JSON 데이터를 Blob으로 감싸서 Content-Type을 명시
  formData.append(
    "request",
    new Blob([JSON.stringify(requestBody)], { type: "application/json" }),
  );

  if (file) {
    formData.append("file", file);
  }
  return formData;
};
```

---

## 상태 관리

이 프로젝트는 두 가지 상태 관리 방식을 사용한다:

| 종류            | 도구          | 용도                                                |
| --------------- | ------------- | --------------------------------------------------- |
| 서버 상태       | React Query   | API에서 가져온 데이터 (게시글 목록, 상세, 카테고리) |
| 클라이언트 상태 | React Context | 인증 상태, 테마 모드                                |

### React Query 설정 (`src/shared/api/queryClient.ts`)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분간 데이터를 "신선"하게 취급
      retry: 1, // 실패 시 1번만 재시도
      refetchOnWindowFocus: false, // 탭 전환 시 자동 재요청 안 함
    },
  },
});
```

### 캐시 키 팩토리 (`src/features/board/hooks/useBoards.ts`)

```typescript
export const boardKeys = {
  all: ["boards"], // 최상위
  lists: () => [...boardKeys.all, "list"], // 모든 목록
  list: (params) => [...boardKeys.lists(), params], // 특정 페이지
  details: () => [...boardKeys.all, "detail"], // 모든 상세
  detail: (id) => [...boardKeys.details(), id], // 특정 게시글
  categories: () => [...boardKeys.all, "categories"], // 카테고리
};
```

계층 구조 덕분에 상위 키로 하위 키를 한번에 무효화할 수 있다:

```typescript
// boardKeys.lists()로 무효화하면
// list({page:0}), list({page:1}), ... 모든 목록 캐시가 함께 무효화된다
queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
```

### 캐시 무효화 전략

| 동작        | 무효화 대상                                  | 이유                         |
| ----------- | -------------------------------------------- | ---------------------------- |
| 게시글 생성 | `boardKeys.lists()`                          | 목록에 새 항목 반영          |
| 게시글 수정 | `boardKeys.lists()` + `boardKeys.detail(id)` | 목록의 제목 + 상세 내용 갱신 |
| 게시글 삭제 | `boardKeys.lists()`                          | 목록에서 항목 제거           |

### React Query 커스텀 훅

```typescript
// Query 훅 (데이터 조회)
useBoards(params); // 게시글 목록 (page, size)
useBoard(id); // 게시글 상세 (id가 falsy이면 요청 안 함)
useBoardCategories(); // 카테고리 맵 (staleTime: Infinity → 캐시 무기한)

// Mutation 훅 (데이터 변경)
useCreateBoard(); // 생성 → 성공 시 목록 캐시 무효화
useUpdateBoard(); // 수정 → 성공 시 목록 + 상세 캐시 무효화
useDeleteBoard(); // 삭제 → 성공 시 목록 캐시 무효화
```

---

## 게시판 기능

### 목록 조회 흐름

```
BoardListPage 마운트
    ↓
useBoards({ page, size }) 호출
    ↓
React Query가 boardKeys.list({ page, size }) 캐시 확인
├── 캐시 있음 (5분 이내) → 캐시 데이터 반환
└── 캐시 없음/만료 → boardApi.getBoards() → GET /boards?page=0&size=10
    ↓
PaginatedResponse<BoardListItem> 수신
    ↓
데스크톱: 테이블 (Category | Title | Date)
모바일: 카드 레이아웃
    ↓
Pagination 컴포넌트로 페이지 이동
```

### 상세 조회 흐름

```
BoardDetailPage 마운트 → URL에서 id 추출
    ↓
useBoard(Number(id)) 호출
    ↓
boardApi.getBoard(id) → GET /boards/:id
    ↓
BoardDetail { id, title, content, boardCategory, imageUrl, createdAt }
    ↓
카테고리 뱃지 + 날짜 + 제목 + 이미지(있으면) + 본문
    ↓
인증된 사용자: Edit / Delete 버튼 표시
```

### 생성/수정 흐름 (BoardFormPage)

하나의 `BoardFormPage`가 URL의 `:id` 유무로 생성/수정 모드를 구분한다:

```typescript
const { id } = useParams<{ id: string }>();
const isEdit = !!id;
```

| 항목         | 생성 모드 (`/boards/new`) | 수정 모드 (`/boards/:id/edit`) |
| ------------ | ------------------------- | ------------------------------ |
| 제목         | "New Post"                | "Edit Post"                    |
| 버튼         | "Publish"                 | "Save Changes"                 |
| 로딩 텍스트  | "Publishing..."           | "Saving..."                    |
| 초기값       | 빈 폼                     | 기존 게시글 데이터 로드        |
| 성공 시 이동 | `/boards`                 | `/boards/:id`                  |
| 이미지       | 새 업로드만               | 기존 이미지 미리보기 + 교체    |

### 삭제 흐름

```
BoardDetailPage에서 "Delete" 클릭
    ↓
confirm("Are you sure you want to delete this post?")
├── 취소 → 아무 동작 없음
└── 확인 → useDeleteBoard().mutate(id)
    ↓
boardApi.deleteBoard(id) → DELETE /boards/:id
    ↓
성공 → 목록 캐시 무효화 → navigate("/boards")
```

---

## 컴포넌트 설계

### 공통 UI 컴포넌트 (`src/shared/components/`)

#### 폼 컴포넌트

| 컴포넌트     | 설명                              | 주요 props                                                                     |
| ------------ | --------------------------------- | ------------------------------------------------------------------------------ |
| `Button`     | 4가지 variant 지원                | `variant` (`primary`/`outline`/`destructive`/`ghost`), `fullWidth`, `disabled` |
| `Input`      | Label + Input + Error 그룹        | `label`, `error`, 나머지 HTML input 속성                                       |
| `Textarea`   | Label + Textarea 그룹             | `label`, 나머지 HTML textarea 속성                                             |
| `Select`     | 네이티브 드롭다운 (커스텀 스타일) | `label`, `options: { value, label }[]`, `placeholder`                          |
| `FileUpload` | 이미지 업로드 + 미리보기          | `file`, `existingImageUrl`, `onChange`                                         |

#### 게시판 컴포넌트

| 컴포넌트        | 설명                                                                                 |
| --------------- | ------------------------------------------------------------------------------------ |
| `CategoryBadge` | 카테고리 코드에 따라 색상이 달라지는 뱃지 (NOTICE=틸, FREE=파랑, QNA=주황, ETC=회색) |
| `CategoryTabs`  | "All" + 카테고리별 필터 탭                                                           |
| `Pagination`    | 이전/다음 + 최대 5개 페이지 번호 버튼                                                |

#### 네비게이션 컴포넌트

| 컴포넌트          | 표시 조건      | 설명                                                       |
| ----------------- | -------------- | ---------------------------------------------------------- |
| `NavHeader`       | 768px 초과     | 데스크톱 헤더: 로고 + 테마 토글 + Write 버튼 + Sign in/out |
| `MobileNavHeader` | 768px 이하     | 모바일 헤더: 로고 + 햄버거 메뉴 (드롭다운)                 |
| `BackLink`        | 상세/폼 페이지 | "← Back to list" 링크                                      |

### 페이지 컴포넌트 (`src/pages/`)

| 페이지            | 레이아웃                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `LoginPage`       | 중앙 카드 (420px), username + password                                                    |
| `SignupPage`      | 중앙 카드, username(이메일) + name + password + confirmPassword, 비밀번호 조건 체크리스트 |
| `BoardListPage`   | 헤더 → 카테고리 탭 → 테이블/카드 → 페이지네이션                                           |
| `BoardDetailPage` | 헤더 → BackLink → 게시글 카드 (메타/제목/이미지/본문/Edit·Delete)                         |
| `BoardFormPage`   | 헤더 → BackLink → 폼 카드 (Title/Category/Image/Content/Cancel·Submit)                    |

---

## 스타일링 & 테마

### 테마 구조 (`src/shared/styles/theme.ts`)

Light/Dark 두 가지 테마를 `AppTheme` 인터페이스로 정의한다:

```typescript
interface AppTheme {
  colors: {
    accentPrimary; // 주요 강조색 (Light: #0D6E6E, Dark: #14A3A3)
    bgPrimary; // 페이지 배경
    bgSurface; // 카드/서피스 배경
    textPrimary; // 기본 텍스트
    error; // 에러 색상
    success; // 성공 색상
    // ... 그 외 다수
  };
  fonts: {
    primary: "'Inter', sans-serif";
    mono: "'JetBrains Mono', monospace";
  };
  breakpoints: {
    mobile: "375px";
    tablet: "768px";
    laptop: "1024px";
    desktop: "1440px";
  };
}
```

### 다크모드 (`src/shared/styles/ThemeContext.tsx`)

- `localStorage`에 `"theme-mode"` 키로 사용자 설정 저장
- 저장값 없으면 OS의 `prefers-color-scheme` 설정을 따름
- `useThemeMode()` 훅으로 `{ mode, toggleTheme }` 접근

```typescript
// 컴포넌트에서 사용 예시
const { mode, toggleTheme } = useThemeMode();
// mode: "light" | "dark"
// toggleTheme(): light ↔ dark 전환
```

### 반응형 브레이크포인트

| 구간     | 너비    | 주요 변화                                |
| -------- | ------- | ---------------------------------------- |
| 모바일   | ≤375px  | 카드 레이아웃, 모바일 헤더, padding 16px |
| 태블릿   | ≤768px  | 모바일 헤더 전환, padding 24px           |
| 랩톱     | ≤1024px | 데스크톱 헤더, padding 120px             |
| 데스크톱 | ≤1440px | 최대 너비, padding 240px                 |
