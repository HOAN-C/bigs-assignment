/**
 * 게시글 작성 페이지.
 *
 * NavHeader → BackLink → FormCard 구조.
 * FormCard: "New Post" 제목 → Title(Input) → Category(Select) → Image(FileUpload) → Content(Textarea) → Actions
 *
 * 반응형 padding: Detail과 동일 패턴
 */
import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  useCreateBoard,
  useBoardCategories,
} from "@/features/board/hooks/useBoards";
import {
  NavHeader,
  MobileNavHeader,
  BackLink,
  Button,
  Input,
  Select,
  Textarea,
  FileUpload,
} from "@/shared/components";

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

export default function BoardCreatePage() {
  const navigate = useNavigate();
  const createBoard = useCreateBoard();
  const { data: categories = {} } = useBoardCategories();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const categoryOptions = Object.entries(categories).map(([value, label]) => ({
    value,
    label: label as string,
  }));

  const handleSubmit = () => {
    setError("");

    if (!title.trim() || !category || !content.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    createBoard.mutate(
      { title, content, category, ...(file ? { file } : {}) },
      {
        onSuccess: () => navigate("/boards"),
        onError: () => setError("Failed to create post."),
      },
    );
  };

  return (
    <Page>
      <NavHeader />
      <MobileNavHeader />
      <Content>
        <BackLink />
        <FormCard>
          <FormTitle>New Post</FormTitle>
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
            <FileUpload file={file} onChange={setFile} />
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
            <Button variant="outline" onClick={() => navigate("/boards")}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createBoard.isPending}>
              {createBoard.isPending ? "Publishing..." : "Publish"}
            </Button>
          </Actions>
        </FormCard>
      </Content>
    </Page>
  );
}
