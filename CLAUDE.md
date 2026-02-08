# BIGS Frontend Hiring Mission — Project Context

This project is a frontend developer hiring mission.

Build a fully functional React + TypeScript web application
using ONLY the provided BIGS API.

DO NOT invent APIs.
DO NOT create mock data.
DO NOT assume additional backend features.

---

# Tech Stack (Mandatory)

- React
- Vite
- TypeScript (strict mode)
- styled-components
- axios
- @tanstack/react-query

---

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

---

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

  Header:
  Authorization Bearer accessToken

  Body:
  refreshToken

---

# API Usage Rules (STRICT)

ONLY use the APIs listed below.

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

---

# API Specification

---

## AUTH APIs

---

### POST /auth/signup

Body (JSON)
username (email)
name
password
confirmPassword

Password Rules:
- minimum 8 characters
- must include number
- must include letter
- must include special character (!%*#?&)

Response:
- 200 OK
- no body

---

### POST /auth/signin

Body (JSON)
username
password

Response:
accessToken
refreshToken

---

### POST /auth/refresh

Header:Authorization Bearer accessToken

Body (JSON)


Response:
accessToken
refreshToken
---

## BOARD APIs (Require Authorization Header)

Header:Authorization Bearer accessToken
---

### POST /boards — Create Board

Content-Type:multipart/form-data

Fields:
title
content
category (NOTICE | FREE | QNA | ETC)
file (optional)
---

### PATCH /boards/{id} — Update Board

Content-Type:multipart/form-data
Fields:
title
content
category
file (optional)
---

### DELETE /boards/{id}

Response:200 OK
---

### GET /boards/{id} — Board Detail

Response Fields:
id
title
content
boardCategory
imageUrl
createdAt
---

### GET /boards?page&size — Board List

Query:
page (0-based)
size

Response:
content array item :
id
title
category
createdAt

pagination:
totalPages
totalElements
number
size
first
last
empty
---

### GET /boards/categories

Response (Record<string, string>):
NOTICE: 공지
FREE: 자유
QNA: Q&A
ETC: 기타

---

# File Upload Rules

- Use FormData
- DO NOT manually set Content-Type header
- axios must auto-handle multipart boundary

---

# Networking Rules

- Shared axios instance only
- Authorization header injected via interceptor
- Refresh requests must NOT use interceptor instance
- Handle concurrent 401 with queue logic
- Prevent infinite refresh loops

---

# React Query Rules

- All server state via react-query
- Use custom hooks for queries
- Avoid direct axios usage inside components
- Cache keys must be structured

---

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

---

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