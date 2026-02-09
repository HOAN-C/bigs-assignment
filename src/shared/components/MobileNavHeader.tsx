/**
 * 모바일 네비게이션 헤더.
 *
 * 로고 + 햄버거 메뉴 아이콘으로 구성.
 * height 56, padding [0,16]. 태블릿(768px) 이하에서만 표시된다.
 * 메뉴 열림 시 간단한 드롭다운으로 네비게이션 옵션을 보여준다.
 */
import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useThemeStore } from "../styles";

const Header = styled.header`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 16px;
    background: ${({ theme }) => theme.colors.bgSurface};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderPrimary};
    width: 100%;
    position: relative;
  }
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
`;

const Logo = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const LogoIcon = styled.span`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.accentPrimary};
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 20px;
  border: none;
  background: none;
  cursor: pointer;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 56px;
  right: 0;
  left: 0;
  background: ${({ theme }) => theme.colors.bgSurface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  display: flex;
  flex-direction: column;
  padding: 8px 16px;
  gap: 4px;
  z-index: 100;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  padding: 12px 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  border-radius: 6px;
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.colors.bgMuted};
  }
`;

export default function MobileNavHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();

  const go = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleSignOut = () => {
    setIsOpen(false);
    signOut();
    // /login 리다이렉트는 signOut() 내부에서 처리
  };

  return (
    <Header>
      <NavLeft onClick={() => go("/boards")}>
        <LogoIcon>▦</LogoIcon>
        <Logo>Board</Logo>
      </NavLeft>
      <MenuButton onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "☰"}
      </MenuButton>
      {isOpen && (
        <Dropdown>
          {isAuthenticated ? (
            <>
              {user && <MenuItem disabled>{user.name}</MenuItem>}
              {user && <MenuItem disabled>{user.username}</MenuItem>}
              <MenuItem onClick={toggleTheme}>
                {mode === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
              </MenuItem>
              <MenuItem onClick={() => go("/boards/new")}>✏️ Write</MenuItem>
              <MenuItem onClick={handleSignOut}>🚪 Sign out</MenuItem>
            </>
          ) : (
            <>
              <MenuItem onClick={() => go("/login")}>🔑 Sign in</MenuItem>
              <MenuItem onClick={() => go("/signup")}>📝 Sign up</MenuItem>
            </>
          )}
        </Dropdown>
      )}
    </Header>
  );
}
