/**
 * 로그인 페이지.
 *
 * 화면 중앙에 LoginCard(420px)를 배치하고 username/password 입력 후 로그인한다.
 * 성공 시 /boards로 이동하며, 하단에 회원가입 링크를 제공한다.
 *
 * 반응형:
 * - 데스크톱/노트북: 카드 420px, padding 40
 * - 모바일(≤375): 카드 full-width, padding [32,24]
 */
import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useSignIn } from '@/features/auth/hooks/useAuth';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button, Input } from '@/shared/components';

const Page = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.bgPrimary};
  padding: 20px;
`;

const Card = styled.div`
  width: 420px;
  max-width: 100%;
  background: ${({ theme }) => theme.colors.bgSurface};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 100%;
    padding: 32px 24px;
    border-radius: 0;
    border: none;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogoIcon = styled.span`
  font-size: 28px;
  color: ${({ theme }) => theme.colors.accentPrimary};
`;

const Brand = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
`;

const LinkText = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ActionLink = styled(Link)`
  color: ${({ theme }) => theme.colors.accentPrimary};
  font-weight: 600;
`;

const ErrorMsg = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 13px;
  text-align: center;
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const signIn = useSignIn();
  const { markAsAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    signIn.mutate(
      { username, password },
      {
        onSuccess: () => {
          markAsAuthenticated();
          navigate('/boards');
        },
        onError: () => {
          setError('Invalid username or password.');
        },
      },
    );
  };

  return (
    <Page>
      <Card>
        <Header>
          <LogoRow>
            <LogoIcon>▦</LogoIcon>
            <Brand>Board</Brand>
          </LogoRow>
          <Subtitle>Sign in to your account</Subtitle>
        </Header>
        <Form onSubmit={handleSubmit}>
          <Input
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form>
        <Actions>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <Button fullWidth onClick={handleSubmit} disabled={signIn.isPending}>
            {signIn.isPending ? 'Signing in...' : 'Sign In'}
          </Button>
          <LinkRow>
            <LinkText>Don't have an account?</LinkText>
            <ActionLink to="/signup">Sign up</ActionLink>
          </LinkRow>
        </Actions>
      </Card>
    </Page>
  );
}
