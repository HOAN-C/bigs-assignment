/**
 * 페이지네이션 컴포넌트.
 *
 * Prev/Next 버튼과 페이지 번호 버튼으로 구성.
 * 36x36 버튼, cornerRadius 6, gap 8.
 */
import styled from 'styled-components';

interface PaginationProps {
  /** 현재 페이지 (0-based) */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const PageBtn = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 13px;
  cursor: pointer;
  border: none;
  transition: background 0.15s ease;

  ${({ $active, theme }) =>
    $active
      ? `
        background: ${theme.colors.accentPrimary};
        color: ${theme.colors.textOnAccent};
        font-weight: 600;
      `
      : `
        background: transparent;
        color: ${theme.colors.textPrimary};
        font-weight: 500;
        border: 1px solid ${theme.colors.borderPrimary};
        &:hover { background: ${theme.colors.bgMuted}; }
      `}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const NavBtn = styled(PageBtn)`
  font-size: 16px;
`;

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  /** 표시할 페이지 번호 범위를 계산 (최대 5개) */
  const getPageNumbers = () => {
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    return Array.from({ length: end - start }, (_, i) => start + i);
  };

  return (
    <Wrapper>
      <NavBtn disabled={currentPage === 0} onClick={() => onPageChange(currentPage - 1)}>
        ‹
      </NavBtn>
      {getPageNumbers().map((page) => (
        <PageBtn key={page} $active={page === currentPage} onClick={() => onPageChange(page)}>
          {page + 1}
        </PageBtn>
      ))}
      <NavBtn
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
      >
        ›
      </NavBtn>
    </Wrapper>
  );
}
