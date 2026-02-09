/**
 * 데스크톱 네비게이션 헤더.
 *
 * 로고(Board) + 우측 액션(Write, Sign in/Sign out, 다크모드 토글)으로 구성.
 * height 64, padding [0,32], border-bottom 1px.
 * 인증 상태에 따라 버튼 노출이 달라진다.
 */
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useThemeMode } from '../styles';
import Button from './Button';

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

const LogoIcon = styled.span`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.accentPrimary};
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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
  const { isAuthenticated, signOut } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  const handleSignOut = () => {
    signOut();
    navigate('/boards');
  };

  return (
    <Header>
      <NavLeft onClick={() => navigate('/boards')}>
        <LogoIcon>▦</LogoIcon>
        <Logo>Board</Logo>
      </NavLeft>
      <NavRight>
        <ThemeToggle onClick={toggleTheme} title="Toggle theme">
          {mode === 'light' ? '🌙' : '☀️'}
        </ThemeToggle>
        {isAuthenticated ? (
          <>
            <Button variant="primary" onClick={() => navigate('/boards/new')}>Write</Button>
            <Button variant="outline" onClick={handleSignOut}>Sign out</Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => navigate('/login')}>Sign in</Button>
        )}
      </NavRight>
    </Header>
  );
}
