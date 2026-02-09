/**
 * 게시글 수정 페이지.
 *
 * BoardCreatePage와 동일 구조. "Edit Post" 제목, "Save Changes" 버튼.
 * useBoard(id)로 기존 데이터를 로드하여 폼 초기값으로 설정한다.
 */
import { useState, useEffect, type FormEvent } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoard, useUpdateBoard, useBoardCategories } from '@/features/board/hooks/useBoards';
import {
  NavHeader,
  MobileNavHeader,
  BackLink,
  Button,
  Input,
  Select,
  Textarea,
  FileUpload,
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

const FormCard = styled.div`
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
    gap: 20px;
  }
`;

const FormTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 18px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: 16px;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: 10px;
  }
`;

const ErrorMsg = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 13px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.textTertiary};
  font-size: 14px;
`;

export default function BoardEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: board, isLoading } = useBoard(Number(id));
  const updateBoard = useUpdateBoard();
  const { data: categories = {} } = useBoardCategories();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  // 기존 데이터가 로드되면 폼 초기값 설정
  useEffect(() => {
    if (board) {
      setTitle(board.title);
      setCategory(board.boardCategory);
      setContent(board.content);
    }
  }, [board]);

  const categoryOptions = Object.entries(categories).map(([value, label]) => ({
    value,
    label: label as string,
  }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!id || !title.trim() || !category || !content.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    updateBoard.mutate(
      { id: Number(id), data: { title, content, category, ...(file ? { file } : {}) } },
      {
        onSuccess: () => navigate(`/boards/${id}`),
        onError: () => setError('Failed to update post.'),
      },
    );
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

  return (
    <Page>
      <NavHeader />
      <MobileNavHeader />
      <Content>
        <BackLink />
        <FormCard>
          <FormTitle>Edit Post</FormTitle>
          <Form onSubmit={handleSubmit}>
            <Input
              label="Title"
              placeholder="Enter post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Select
              label="Category"
              options={categoryOptions}
              placeholder="All Categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <FileUpload
              file={file}
              existingImageUrl={board?.imageUrl}
              onChange={setFile}
            />
            <Textarea
              label="Content"
              placeholder="Write your post content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </Form>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <Actions>
            <Button variant="outline" onClick={() => navigate(`/boards/${id}`)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={updateBoard.isPending}>
              {updateBoard.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </Actions>
        </FormCard>
      </Content>
    </Page>
  );
}
