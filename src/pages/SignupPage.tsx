/**
 * 회원가입 페이지.
 *
 * username, name, password, confirmPassword 4개 필드를 입력받는다.
 * 성공 시 /login으로 이동하며, 하단에 로그인 링크를 제공한다.
 *
 * 반응형: LoginPage와 동일 패턴
 */
import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useSignUp } from '@/features/auth/hooks/useAuth';
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
    padding: 24px;
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

export default function SignupPage() {
  const navigate = useNavigate();
  const signUp = useSignUp();
  const [form, setForm] = useState({ username: '', name: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    signUp.mutate(form, {
      onSuccess: () => navigate('/login'),
      onError: () => setError('Sign up failed. Please try again.'),
    });
  };

  return (
    <Page>
      <Card>
        <Header>
          <LogoRow>
            <LogoIcon>▦</LogoIcon>
            <Brand>Board</Brand>
          </LogoRow>
          <Subtitle>Create a new account</Subtitle>
        </Header>
        <Form onSubmit={handleSubmit}>
          <Input
            label="Username"
            placeholder="Choose a username"
            value={form.username}
            onChange={update('username')}
            required
          />
          <Input
            label="Name"
            placeholder="Enter your name"
            value={form.name}
            onChange={update('name')}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={update('password')}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            required
          />
        </Form>
        <Actions>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <Button fullWidth onClick={handleSubmit} disabled={signUp.isPending}>
            {signUp.isPending ? 'Creating...' : 'Create Account'}
          </Button>
          <LinkRow>
            <LinkText>Already have an account?</LinkText>
            <ActionLink to="/login">Sign in</ActionLink>
          </LinkRow>
        </Actions>
      </Card>
    </Page>
  );
}
