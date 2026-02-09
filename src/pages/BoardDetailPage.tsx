/**
 * 게시글 상세 페이지.
 *
 * NavHeader → BackLink → ArticleCard 구조.
 * ArticleCard: Meta(Badge+Date) → Title → Divider → Image(선택) → Body → Divider → Actions(Edit/Delete)
 *
 * 반응형 padding: 1440(240), 1024(120), 768(24), 375(16)
 */
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoard, useDeleteBoard } from '@/features/board/hooks/useBoards';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  NavHeader,
  MobileNavHeader,
  BackLink,
  CategoryBadge,
  Button,
} from '@/shared/components';

const Page = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.bgPrimary};
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px 240px;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.laptop}) {
    padding: 32px 120px;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 24px 24px;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 16px;
    gap: 16px;
  }
`;

const ArticleCard = styled.div`
  background: ${({ theme }) => theme.colors.bgSurface};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    border-radius: 10px;
    padding: 20px;
    gap: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: 10px;
  }
`;

const DateText = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const ArticleTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  word-break: break-word;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 20px;
  }
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background: ${({ theme }) => theme.colors.borderDivider};
  width: 100%;
`;

const ImageContainer = styled.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bgMuted};

  img {
    width: 100%;
    max-height: 400px;
    object-fit: contain;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    max-height: 200px;
    img { max-height: 200px; }
  }
`;

const Body = styled.div`
  font-size: 15px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: pre-wrap;
  word-break: break-word;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 14px;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: 10px;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.textTertiary};
  font-size: 14px;
`;

export default function BoardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: board, isLoading } = useBoard(Number(id));
  const deleteBoard = useDeleteBoard();

  const handleDelete = () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    deleteBoard.mutate(Number(id), {
      onSuccess: () => navigate('/boards'),
    });
  };

  if (isLoading) {
    return (
      <Page>
        <NavHeader />
        <MobileNavHeader />
        <Content><LoadingState>Loading...</LoadingState></Content>
      </Page>
    );
  }

  if (!board) {
    return (
      <Page>
        <NavHeader />
        <MobileNavHeader />
        <Content><LoadingState>Post not found.</LoadingState></Content>
      </Page>
    );
  }

  return (
    <Page>
      <NavHeader />
      <MobileNavHeader />
      <Content>
        <BackLink />
        <ArticleCard>
          <Header>
            <MetaRow>
              <CategoryBadge category={board.boardCategory} />
              <DateText>{board.createdAt.split('T')[0]}</DateText>
            </MetaRow>
            <ArticleTitle>{board.title}</ArticleTitle>
          </Header>
          <Divider />
          {board.imageUrl && (
            <ImageContainer>
              <img src={board.imageUrl} alt="attached" />
            </ImageContainer>
          )}
          <Body>{board.content}</Body>
          {isAuthenticated && (
            <>
              <Divider />
              <Actions>
                <Button variant="outline" onClick={() => navigate(`/boards/${id}/edit`)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteBoard.isPending}
                >
                  {deleteBoard.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </Actions>
            </>
          )}
        </ArticleCard>
      </Content>
    </Page>
  );
}
