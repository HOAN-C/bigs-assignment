/**
 * 카테고리 배지 컴포넌트.
 *
 * 카테고리 코드(NOTICE, FREE, QNA, ETC)에 따라 색상이 달라진다.
 * cornerRadius 4, padding [4,10], fontSize 11, letterSpacing 1.
 */
import styled, { useTheme } from 'styled-components';
import type { AppTheme } from '../styles/theme';

interface CategoryBadgeProps {
  category: string;
  /** 배지 최소 너비 (목록 테이블에서 정렬용) */
  minWidth?: number;
}

/** 카테고리 코드에 대응하는 텍스트/배경 색상을 반환 */
function getCategoryStyle(category: string, theme: AppTheme) {
  switch (category.toUpperCase()) {
    case 'NOTICE':
      return { color: theme.colors.categoryNotice, bg: theme.colors.accentSubtle };
    case 'FREE':
      return { color: theme.colors.categoryFree, bg: '#EBF2FE' };
    case 'QNA':
      return { color: theme.colors.categoryQna, bg: '#FEF0EB' };
    default:
      return { color: theme.colors.categoryEtc, bg: theme.colors.bgMuted };
  }
}

const Badge = styled.span<{ $color: string; $bg: string; $minWidth?: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  color: ${({ $color }) => $color};
  background: ${({ $bg }) => $bg};
  white-space: nowrap;
  ${({ $minWidth }) => $minWidth && `min-width: ${$minWidth}px; text-align: center;`}
`;

export default function CategoryBadge({ category, minWidth }: CategoryBadgeProps) {
  const theme = useTheme();
  const style = getCategoryStyle(category, theme);

  return (
    <Badge $color={style.color} $bg={style.bg} $minWidth={minWidth}>
      {category.toUpperCase()}
    </Badge>
  );
}
