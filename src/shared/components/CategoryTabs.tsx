/**
 * 카테고리 필터 탭 목록.
 *
 * "All" + 서버에서 받은 카테고리 목록을 탭으로 렌더링한다.
 * 선택된 탭은 accent-primary 배경, 나머지는 bg-muted 배경.
 */
import styled from 'styled-components';

interface CategoryTabsProps {
  /** 카테고리 코드-표시명 맵 (예: { NOTICE: "공지", FREE: "자유" }) */
  categories: Record<string, string>;
  /** 현재 선택된 카테고리 (null이면 All) */
  selected: string | null;
  onSelect: (category: string | null) => void;
}

const Wrapper = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: 6px;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.accentPrimary : theme.colors.bgMuted};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.textOnAccent : theme.colors.textSecondary};
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  border: none;

  &:hover {
    opacity: 0.85;
  }
`;

export default function CategoryTabs({ categories, selected, onSelect }: CategoryTabsProps) {
  return (
    <Wrapper>
      <Tab $active={selected === null} onClick={() => onSelect(null)}>
        All
      </Tab>
      {Object.entries(categories).map(([code, label]) => (
        <Tab key={code} $active={selected === code} onClick={() => onSelect(code)}>
          {label}
        </Tab>
      ))}
    </Wrapper>
  );
}
