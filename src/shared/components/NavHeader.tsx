/**
 * 데스크톱 네비게이션 헤더.
 *
 * 로고(Board) + 우측 액션(Write, Sign in/Sign out, 다크모드 토글)으로 구성.
 * height 64, padding [0,32], border-bottom 1px.
 * 인증 상태에 따라 버튼 노출이 달라진다.
 */
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useThemeStore } from "../styles";
import Button from "./Button";

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 32px;
  background: ${({ theme }) => theme.colors.bgSurface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const Logo = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgMuted};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 18px;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.borderPrimary};
  }
`;

export default function NavHeader() {
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();

  const handleSignOut = () => {
    signOut();
    // /login 리다이렉트는 signOut() 내부에서 처리
  };

  return (
    <Header>
      <NavLeft onClick={() => navigate("/boards")}>
        <Logo>BIGS</Logo>
      </NavLeft>
      <NavRight>
        {isAuthenticated ? (
          <>
            {user && <UserName>{user.name}</UserName>}
            {user && <UserName>{user.username}</UserName>}
            <ThemeToggle onClick={toggleTheme} title="Toggle theme">
              {mode === "light" ? "🌙" : "☀️"}
            </ThemeToggle>
            <Button variant="primary" onClick={() => navigate("/boards/new")}>
              Write
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign out
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => navigate("/login")}>
            Sign in
          </Button>
        )}
      </NavRight>
    </Header>
  );
}
