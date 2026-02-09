/**
 * 게시글 작성/수정 통합 페이지.
 *
 * useParams의 id 유무로 생성/수정 모드를 구분한다.
 * - 생성 모드: 빈 폼, "New Post" 제목, "Publish" 버튼
 * - 수정 모드: 기존 데이터 로드, "Edit Post" 제목, "Save Changes" 버튼
 *
 * NavHeader → BackLink → FormCard 구조.
 * 반응형 padding: Detail과 동일 패턴.
 */
import { useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import {
  useBoard,
  useCreateBoard,
  useUpdateBoard,
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

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.textTertiary};
  font-size: 14px;
`;

export default function BoardFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  // id가 없으면 NaN → useBoard 내부의 enabled: !!id 로 요청이 비활성화된다
  const { data: board, isLoading } = useBoard(Number(id));
  const createBoard = useCreateBoard();
  const updateBoard = useUpdateBoard();
  const { data: categories = {} } = useBoardCategories();

  interface FormState {
    title: string;
    category: string;
    content: string;
  }

  const [form, setForm] = useState<FormState>({
    title: "",
    category: "",
    content: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const [syncedBoardId, setSyncedBoardId] = useState<number | null>(null);
  if (isEdit && board && syncedBoardId !== board.id) {
    setSyncedBoardId(board.id);
    setForm({
      title: board.title,
      category: board.boardCategory,
      content: board.content,
    });
  }

  const categoryOptions = Object.entries(categories).map(([value, label]) => ({
    value,
    label: label as string,
  }));

  const mutation = isEdit ? updateBoard : createBoard;

  const handleSubmit = () => {
    setError("");

    if (!form.title.trim() || !form.category || !form.content.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    const payload = {
      title: form.title,
      content: form.content,
      category: form.category,
      ...(file ? { file } : {}),
    };

    if (isEdit) {
      updateBoard.mutate(
        { id: Number(id), data: payload },
        {
          onSuccess: () => navigate(`/boards/${id}`),
          onError: () => setError("Failed to update post."),
        },
      );
    } else {
      createBoard.mutate(payload, {
        onSuccess: () => navigate("/boards"),
        onError: () => setError("Failed to create post."),
      });
    }
  };

  if (isEdit && isLoading) {
    return (
      <Page>
        <NavHeader />
        <MobileNavHeader />
        <Content>
          <LoadingState>Loading...</LoadingState>
        </Content>
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
          <FormTitle>{isEdit ? "Edit Post" : "New Post"}</FormTitle>
          <Form onSubmit={handleSubmit}>
            <Input
              label="Title"
              placeholder="Enter post title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
            <Select
              label="Category"
              options={categoryOptions}
              placeholder="All Categories"
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value }))
              }
            />
            <FileUpload
              file={file}
              existingImageUrl={isEdit ? board?.imageUrl : undefined}
              onChange={setFile}
            />
            <Textarea
              label="Content"
              placeholder="Write your post content..."
              value={form.content}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, content: e.target.value }))
              }
              required
            />
          </Form>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <Actions>
            <Button
              variant="outline"
              onClick={() => navigate(isEdit ? `/boards/${id}` : "/boards")}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending
                ? isEdit
                  ? "Saving..."
                  : "Publishing..."
                : isEdit
                  ? "Save Changes"
                  : "Publish"}
            </Button>
          </Actions>
        </FormCard>
      </Content>
    </Page>
  );
}
