# Bigs Board

---

## 목차

1. [기술 스택과 선택 이유](#기술-스택과-선택-이유)
2. [실행 방법](#실행-방법)
3. [폴더 구조](#폴더-구조)
4. [전체 아키텍처](#전체-아키텍처)
5. [인증 시스템](#인증-시스템)
6. [API 통신 구조](#api-통신-구조)
7. [상태 관리 구조](#상태-관리-구조)
8. [라우팅과 접근 제어](#라우팅과-접근-제어)
9. [설계 결정과 트레이드오프](#설계-결정과-트레이드오프)

---

## 기술 스택과 선택 이유

| 분류            | 기술                  | 선택 이유                                                        |
| --------------- | --------------------- | ---------------------------------------------------------------- |
| UI              | React 19              | 컴포넌트 기반 선언적 UI, 생태계 성숙도                           |
| 언어            | TypeScript (strict)   | `any` 금지, 컴파일 타임 타입 안전성                              |
| 빌드            | Vite 7                | esbuild 기반 HMR, Webpack 대비 빠른 빌드                         |
| 스타일          | styled-components     | 테마 토큰을 props로 전달, 동적 스타일링에 유리                   |
| HTTP            | axios                 | 인터셉터로 토큰 부착/갱신 자동화, 인스턴스 분리 가능             |
| 서버 상태       | @tanstack/react-query | 캐시 키 계층화, 자동 무효화, 로딩/에러 상태 관리                 |
| 클라이언트 상태 | Zustand               | Provider 불필요, React 외부(인터셉터)에서 `getState()` 접근 가능 |
| JWT             | jwt-decode            | accessToken payload에서 사용자 정보 추출 (서명 검증은 서버 담당) |
| 쿠키            | js-cookie             | refreshToken을 SameSite=Strict 쿠키로 관리                       |

### Zustand을 선택한 이유

인증 상태는 React 컴포넌트뿐 아니라 **axios 인터셉터**(React 외부)에서도 접근해야 한다.
Context API는 `useContext()`로만 접근 가능하지만, Zustand은 `useAuthStore.getState()`로 어디서든 동기적으로 읽고 쓸 수 있다.

---

## 실행 방법

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```

### 환경 변수

프로젝트 루트 `.env`:

```
VITE_API_BASE_URL=https://front-mission.bigs.or.kr
```

---

## 폴더 구조

```
src/
├── main.tsx                        # Provider 트리 구성
├── App.tsx                         # 라우트 정의
│
├── features/                       # 도메인 단위 모듈
│   ├── auth/
│   │   ├── api/index.ts            #   signUp, signIn API
│   │   ├── store/useAuthStore.ts   #   Zustand 인증 스토어
│   │   ├── hooks/useAuth.ts        #   useSignUp, useSignIn 뮤테이션
│   │   ├── utils/decodeToken.ts    #   JWT 디코딩 유틸리티
│   │   └── types/index.ts          #   AuthUser, TokenPayload 등
│   │
│   └── board/
│       ├── api/index.ts            #   게시글 CRUD API
│       ├── hooks/useBoards.ts      #   React Query 훅 + 캐시 키
│       └── types/index.ts          #   BoardDetail, PaginatedResponse 등
│
├── pages/                          # 라우트 1:1 매핑
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── BoardListPage.tsx
│   ├── BoardDetailPage.tsx
│   └── BoardFormPage.tsx           #   생성/수정 통합
│
└── shared/
    ├── api/
    │   ├── client.ts               #   axios 인스턴스 + 인터셉터
    │   ├── tokenStorage.ts         #   토큰 저장소 (메모리 + 쿠키)
    │   └── queryClient.ts          #   React Query 설정
    ├── components/                 #   재사용 UI (Button, Input 등)
    └── styles/
        ├── theme.ts                #   Light/Dark 디자인 토큰
        ├── useThemeStore.ts        #   Zustand 테마 스토어
        └── ThemeProvider.tsx        #   styled-components 연결
```

---

## 전체 아키텍처

### Provider 트리

```
StrictMode
  └─ QueryClientProvider          // React Query 캐시
       └─ BrowserRouter           // 클라이언트 라우팅
            └─ ThemeModeProvider   // styled-components 테마 주입
                 └─ App
```

인증(`useAuthStore`)과 테마(`useThemeStore`)는 Zustand이므로 Provider가 필요 없다.
`ThemeModeProvider`는 styled-components `ThemeProvider`를 감싸는 래퍼로만 존재한다.

### 데이터 흐름

```
컴포넌트 → 커스텀 훅 → React Query(캐시 확인) → API 함수 → apiClient(인터셉터가 토큰 부착) → 서버
                                                                                                ↓
컴포넌트 ← 리렌더 ← React Query(캐시 저장) ← ─────────────────────────────────────── 응답
```

---

## 인증 시스템

### 토큰 저장 전략

| 토큰         | 저장 위치                        | 이유                                                            |
| ------------ | -------------------------------- | --------------------------------------------------------------- |
| accessToken  | JavaScript 메모리(변수)          | XSS로 탈취 불가. 새로고침 시 사라지지만 refreshToken으로 재발급 |
| refreshToken | 쿠키 (SameSite=Strict, 7일 만료) | CSRF 방어. 브라우저가 자동 관리                                 |

### 로그인 흐름

```
사용자 입력 → POST /auth/signin → { accessToken, refreshToken }
                                        │
                                        ├─ tokenStorage.setTokens()     // 토큰 저장
                                        ├─ decodeAccessToken()          // JWT → { name, username }
                                        ├─ useAuthStore.setUser()       // 스토어에 사용자 정보
                                        ├─ useAuthStore.setAuthenticated(true)
                                        └─ navigate("/boards")
```

### 토큰 자동 갱신 (핵심)

```
API 요청 → 서버 401/403 응답
              │
              ├─ 이미 갱신 중? → 대기 큐(failedQueue)에 추가, 갱신 완료 대기
              │
              └─ 갱신 시작
                   ├─ POST /auth/refresh (기본 axios 사용, 인터셉터 무한루프 방지)
                   │    ├─ 성공 → 새 토큰 저장 + 사용자 정보 갱신 + 대기 큐 일괄 재시도
                   │    └─ 실패 → 대기 큐 전체 reject + forceSignOut()
                   │
                   └─ refreshToken 없음 → forceSignOut() → /login 리다이렉트
```

**동시 401 처리**: 여러 API가 동시에 401을 받으면, 첫 번째만 갱신하고 나머지는 큐에서 대기한다.
`isRefreshing` 플래그 + `failedQueue` 배열로 구현했다.

**새로고침 직후**: accessToken은 메모리에서 사라지지만 refreshToken(쿠키)은 남아있다.
요청 인터셉터가 이를 감지하고 API 호출 전에 **선제적으로** 토큰을 갱신한다.

### 로그아웃

```
signOut() → tokenStorage.clearTokens() → { isAuthenticated: false, user: null } → window.location.replace("/login")
```

`window.location.replace`를 사용한 이유: Zustand은 React Router의 `navigate`에 접근할 수 없다.
인증 실패는 드문 이벤트이므로 SPA 전환 대신 풀 리로드가 합리적이다.

### useAuthStore 인터페이스

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null; // JWT payload에서 추출한 { name, username }
  setAuthenticated: (v: boolean) => void;
  setUser: (user: AuthUser | null) => void;
  signOut: () => void; // 사용자 주도 로그아웃
  forceSignOut: () => void; // 인터셉터에서 호출하는 강제 로그아웃
}
```

---

## API 통신 구조

### 인스턴스 분리

| 용도      | 인스턴스                    | 이유                          |
| --------- | --------------------------- | ----------------------------- |
| 일반 API  | `apiClient` (공유 인스턴스) | 인터셉터가 토큰 자동 부착     |
| 토큰 갱신 | `axios` (기본 인스턴스)     | 인터셉터를 타면 무한루프 발생 |

### 인터셉터 동작

```
[요청 인터셉터]
  1. accessToken 확인
  2. 없으면 refreshToken으로 선제적 갱신 (새로고침 직후 대응)
  3. Authorization 헤더 부착

[응답 인터셉터]
  1. 401/403 감지
  2. _retry 플래그로 무한 루프 방지
  3. isRefreshing이면 큐에 추가, 아니면 갱신 시작
  4. 갱신 성공 → 원래 요청 재시도
  5. 갱신 실패 → forceSignOut()
```

### API 엔드포인트

| 메서드   | 경로                     | 설명                                     |
| -------- | ------------------------ | ---------------------------------------- |
| `POST`   | `/auth/signup`           | 회원가입                                 |
| `POST`   | `/auth/signin`           | 로그인 → `{ accessToken, refreshToken }` |
| `POST`   | `/auth/refresh`          | 토큰 갱신 (인터셉터에서 자동 호출)       |
| `GET`    | `/boards?page=0&size=10` | 게시글 목록 (페이지네이션)               |
| `GET`    | `/boards/:id`            | 게시글 상세                              |
| `GET`    | `/boards/categories`     | 카테고리 목록                            |
| `POST`   | `/boards`                | 게시글 생성 (FormData)                   |
| `PATCH`  | `/boards/:id`            | 게시글 수정 (FormData)                   |
| `DELETE` | `/boards/:id`            | 게시글 삭제                              |

### FormData 변환

서버가 JSON 필드를 `"request"`라는 이름의 Blob 파트로 요구한다:

```typescript
formData.append(
  "request",
  new Blob([JSON.stringify(requestBody)], { type: "application/json" }),
);
```

---

## 상태 관리 구조

### 역할 분리

| 종류            | 도구        | 대상             | 이유                                     |
| --------------- | ----------- | ---------------- | ---------------------------------------- |
| 서버 상태       | React Query | 게시글, 카테고리 | 캐싱, 자동 갱신, 로딩/에러 상태          |
| 클라이언트 상태 | Zustand     | 인증, 테마       | Provider 없이 전역 접근, React 외부 접근 |
| 폼 상태         | useState    | 입력값           | 컴포넌트 로컬, 서버 동기화 불필요        |

### React Query 캐시 키 계층

```
["boards"]                              ← boardKeys.all
  ├─ ["boards", "list"]                 ← boardKeys.lists()
  │    └─ ["boards", "list", {page, size}]  ← boardKeys.list(params)
  ├─ ["boards", "detail"]              ← boardKeys.details()
  │    └─ ["boards", "detail", 42]     ← boardKeys.detail(42)
  └─ ["boards", "categories"]          ← boardKeys.categories()
```

계층 구조이므로 상위 키로 하위를 일괄 무효화할 수 있다:

| 동작 | 무효화 대상              | 이유                            |
| ---- | ------------------------ | ------------------------------- |
| 생성 | `lists()`                | 새 항목을 목록에 반영           |
| 수정 | `lists()` + `detail(id)` | 목록 제목 + 상세 내용 동시 갱신 |
| 삭제 | `lists()`                | 목록에서 항목 제거              |

### 카테고리 캐시

`useBoardCategories()`는 `staleTime: Infinity`로 설정했다.
카테고리 목록은 사실상 정적 데이터이므로 앱 생명주기 동안 재요청하지 않는다.

---

## 라우팅과 접근 제어

| 경로               | 페이지          | 가드             | 설명                     |
| ------------------ | --------------- | ---------------- | ------------------------ |
| `/`                | -               | -                | `/boards`로 리다이렉트   |
| `/login`           | LoginPage       | `GuestRoute`     | 인증 시 `/boards`로 이동 |
| `/signup`          | SignupPage      | `GuestRoute`     | 인증 시 `/boards`로 이동 |
| `/boards`          | BoardListPage   | `ProtectedRoute` | 게시글 목록              |
| `/boards/new`      | BoardFormPage   | `ProtectedRoute` | 게시글 작성              |
| `/boards/:id`      | BoardDetailPage | 없음             | 게시글 상세              |
| `/boards/:id/edit` | BoardFormPage   | `ProtectedRoute` | 게시글 수정              |

- **ProtectedRoute**: 미인증 → `/login` 리다이렉트
- **GuestRoute**: 인증됨 → `/boards` 리다이렉트 (로그인 페이지 재접근 방지)
- **BoardFormPage**: URL의 `:id` 유무로 생성/수정 모드를 자동 구분하는 통합 컴포넌트

---

## 설계 결정과 트레이드오프

### 1. accessToken을 메모리에 저장한 이유

localStorage에 저장하면 XSS 공격 시 토큰이 탈취된다.
메모리 변수는 JavaScript 실행 컨텍스트 내에서만 접근 가능하므로 DOM 기반 공격에 안전하다.
대신 새로고침마다 토큰이 사라지는데, 요청 인터셉터가 refreshToken으로 선제적 갱신하여 해결했다.

### 2. 토큰 갱신 시 큐 패턴을 사용한 이유

페이지에 여러 API 호출이 동시에 있을 때, 토큰 만료 시 모두 401을 받는다.
큐 없이 각각 갱신하면 `/auth/refresh`가 N번 호출된다.
`isRefreshing` 플래그로 첫 번째만 갱신하고, 나머지는 `failedQueue`에서 대기시킨 뒤 갱신 완료 후 일괄 재시도한다.

### 3. 토큰 갱신에 기본 axios를 사용한 이유

갱신 요청이 `apiClient`를 타면, 응답 인터셉터가 다시 401을 감지하고 갱신을 시도하는 무한루프가 발생한다.
기본 `axios`는 인터셉터가 없으므로 이 문제를 원천 차단한다.

### 4. tokenStorage에서 onAuthChange 콜백을 제거한 이유

초기에는 tokenStorage가 콜백으로 스토어를 갱신하는 옵저버 패턴을 사용했다.
Zustand은 `getState()`로 React 외부에서 직접 접근 가능하므로 콜백이 불필요하다.
각 호출부에서 `tokenStorage.setTokens()` + `useAuthStore.getState().setAuthenticated(true)`를 명시적으로 호출하는 방식이 흐름을 추적하기 쉽다.

### 5. Zustand에서 window.location.replace를 사용한 이유

Zustand 스토어는 React 컴포넌트가 아니므로 `useNavigate()` 훅을 사용할 수 없다.
`navigate` 함수를 외부에서 주입하는 패턴도 가능하지만, 인증 실패는 드문 이벤트이므로
풀 리로드(`window.location.replace`)가 더 단순하고 부수효과(메모리 누수 등)를 깔끔히 정리한다.

### 6. 생성/수정 페이지를 통합한 이유

`BoardFormPage` 하나가 URL의 `:id` 유무로 모드를 구분한다.
폼 UI, 유효성 검사, FormData 변환 로직이 동일하므로 분리하면 중복이 발생한다.
제목, 버튼 텍스트, 성공 시 이동 경로만 분기한다.

### 7. JWT 디코딩으로 사용자 정보를 얻는 이유

별도의 `/me` API가 없다. accessToken의 payload에 `{ name, username }`이 포함되어 있으므로
jwt-decode로 클라이언트에서 추출한다. 서명 검증은 서버가 담당하고, 클라이언트는 payload 읽기만 한다.

### 8. FormData에서 JSON을 Blob으로 감싼 이유

서버(Spring)가 `@RequestPart("request")` 어노테이션으로 JSON 파트를 받는다.
일반 `formData.append("request", JSON.stringify(data))`는 `text/plain`으로 전송되어 파싱에 실패한다.
`new Blob([JSON.stringify(data)], { type: "application/json" })`으로 감싸야 서버가 JSON으로 인식한다.
