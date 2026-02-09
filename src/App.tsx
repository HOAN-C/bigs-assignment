/**
 * 앱 라우팅 설정.
 *
 * 6개 페이지를 경로에 매핑하고,
 * ProtectedRoute/GuestRoute로 인증 기반 접근 제어를 적용한다.
 * "/" 접근 시 "/boards"로 리다이렉트한다.
 */
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "@/shared/components";
import {
  LoginPage,
  SignupPage,
  BoardListPage,
  BoardDetailPage,
  BoardFormPage,
} from "@/pages";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/boards" replace />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <SignupPage />
          </GuestRoute>
        }
      />
      <Route
        path="/boards"
        element={
          <ProtectedRoute>
            <BoardListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/boards/new"
        element={
          <ProtectedRoute>
            <BoardFormPage />
          </ProtectedRoute>
        }
      />
      <Route path="/boards/:id" element={<BoardDetailPage />} />
      <Route
        path="/boards/:id/edit"
        element={
          <ProtectedRoute>
            <BoardFormPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
