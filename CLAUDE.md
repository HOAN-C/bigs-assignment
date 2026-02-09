Build a fully functional React + TypeScript web application

DO NOT invent APIs.
DO NOT create mock data.
DO NOT assume additional backend features.

# Tech Stack (Mandatory)
- React
- Vite
- TypeScript (strict mode)
- styled-components
- axios
- @tanstack/react-query

# Core Architecture Rules
- Feature-based folder structure
- Separate API layer from UI
- Shared axios instance
- React Query for all server state
- Functional components only
- Reusable UI components
- Responsive design required
- Dark mode support required
- No class components
- Avoid `any`
- Strict typing required

# Authentication Rules
- accessToken is stored client-side
- refreshToken is used for token refresh
- All board APIs require Bearer Token
- axios interceptor MUST:
  - attach accessToken automatically
  - detect 401 responses
  - request `/auth/refresh`
  - retry original request

- Refresh request requires:
  Body: refreshToken

# API Usage Rules (STRICT)
DO NOT implement:
- user profile
- author information
- comments
- likes
- view counts
- followers
- avatars
- extra endpoints
- fake statistics

DO NOT assume missing data fields exist.

# File Upload Rules
- DO NOT manually set Content-Type header
- axios must auto-handle multipart boundary

# Networking Rules
- Shared axios instance only
- Authorization header injected via interceptor
- Refresh requests must NOT use interceptor instance
- Handle concurrent 401 with queue logic
- Prevent infinite refresh loops

# React Query Rules
- All server state via react-query
- Use custom hooks for queries
- Avoid direct axios usage inside components
- Cache keys must be structured

# UI Restrictions
DO NOT implement:
- user profile
- avatars
- author metadata
- comments
- likes
- statistics
- followers
- admin features

# Coding Standards
- strict TypeScript
- no any
- functional components
- styled-components only
- separate API & UI logic
- modular hooks
- reusable UI components
- responsive layouts
- dark mode supported

# Commenting Rules
- 파일 상단: 이 파일의 역할과 동작 흐름을 설명하여 처음 보는 사람이 전체 구조를 바로 파악할 수 있게 한다
- 복잡한 로직: "왜 이렇게 했는지"를 설명한다 (예: 왜 기본 axios를 쓰는지, 왜 Blob으로 감싸는지)
- 타입/인터페이스: 필드명만으로 의미가 불분명한 프로퍼티에 `/** */` JSDoc을 단다
- 자명한 코드: 주석을 달지 않는다 (코드 자체가 설명이 되는 경우)
- 배럴 파일: 단순 re-export이므로 주석 없음
- 언어: 한국어