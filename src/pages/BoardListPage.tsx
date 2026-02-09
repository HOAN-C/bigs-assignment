/**
 * 게시판 목록 페이지.
 *
 * NavHeader → PageHeader(제목 + 게시글 수) → CategoryTabs → BoardList → Pagination.
 * 데스크톱에서는 테이블 형태(Category | Title | Date),
 * 모바일에서는 카드 형태(Badge+Date 상단, Title 하단)로 보여준다.
 *
 * 반응형 padding: 1440(120), 1024(60), 768(24), 375(16)
 */
import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useBoards, useBoardCategories } from '@/features/board/hooks/useBoards';
import {
  NavHeader,
  MobileNavHeader,
  CategoryTabs,
  CategoryBadge,
  Pagination,
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
  padding: 32px 120px;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.laptop}) {
    padding: 32px 60px;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 24px 24px;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 20px 16px;
    gap: 16px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 22px;
  }
`;

const Meta = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textTertiary};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 12px;
  }
`;

/* 데스크톱 테이블 형태 */
const BoardTable = styled.div`
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  background: ${({ theme }) => theme.colors.bgSurface};
  overflow: hidden;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: ${({ theme }) => theme.colors.bgMuted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderPrimary};
`;

const HeaderCell = styled.span<{ $width?: string; $align?: string }>`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.textTertiary};
  ${({ $width }) => $width && `width: ${$width}; flex-shrink: 0;`}
  ${({ $align }) => $align && `text-align: ${$align};`}
  ${({ $width }) => !$width && 'flex: 1;'}
`;

const TableRow = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDivider};
  cursor: pointer;
  transition: background 0.1s ease;

  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.colors.bgMuted}; }
`;

const RowBadge = styled.div`
  width: 80px;
  flex-shrink: 0;
`;

const RowTitle = styled.span`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowDate = styled.span`
  width: 100px;
  flex-shrink: 0;
  text-align: right;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

/* 모바일 카드 형태 */
const MobileList = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

const MobileCard = styled.div`
  background: ${({ theme }) => theme.colors.bgSurface};
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
`;

const MobileCardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const MobileCardTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MobileDate = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const PaginationWrap = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.textTertiary};
  font-size: 14px;
`;

export default function BoardListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories = {} } = useBoardCategories();
  const { data: boardsData, isLoading } = useBoards({
    page,
    size: 10,
    ...(selectedCategory ? { category: selectedCategory } : {}),
  });

  const handleCategoryChange = (cat: string | null) => {
    setSelectedCategory(cat);
    setPage(0);
  };

  const boards = boardsData?.content ?? [];
  const totalPages = boardsData?.totalPages ?? 0;
  const totalElements = boardsData?.totalElements ?? 0;

  return (
    <Page>
      <NavHeader />
      <MobileNavHeader />
      <Content>
        <PageHeader>
          <Title>Board</Title>
          <Meta>{totalElements} posts</Meta>
        </PageHeader>

        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={handleCategoryChange}
        />

        {isLoading ? (
          <EmptyState>Loading...</EmptyState>
        ) : boards.length === 0 ? (
          <EmptyState>No posts found.</EmptyState>
        ) : (
          <>
            {/* 데스크톱 테이블 */}
            <BoardTable>
              <TableHeader>
                <HeaderCell $width="80px">Category</HeaderCell>
                <HeaderCell>Title</HeaderCell>
                <HeaderCell $width="100px" $align="right">Date</HeaderCell>
              </TableHeader>
              {boards.map((board) => (
                <TableRow key={board.id} onClick={() => navigate(`/boards/${board.id}`)}>
                  <RowBadge>
                    <CategoryBadge category={board.category} />
                  </RowBadge>
                  <RowTitle>{board.title}</RowTitle>
                  <RowDate>{board.createdAt.split('T')[0]}</RowDate>
                </TableRow>
              ))}
            </BoardTable>

            {/* 모바일 카드 */}
            <MobileList>
              {boards.map((board) => (
                <MobileCard key={board.id} onClick={() => navigate(`/boards/${board.id}`)}>
                  <MobileCardTop>
                    <CategoryBadge category={board.category} />
                    <MobileDate>{board.createdAt.split('T')[0]}</MobileDate>
                  </MobileCardTop>
                  <MobileCardTitle>{board.title}</MobileCardTitle>
                </MobileCard>
              ))}
            </MobileList>
          </>
        )}

        <PaginationWrap>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </PaginationWrap>
      </Content>
    </Page>
  );
}
