/**
 * "← Back to list" 뒤로가기 링크.
 *
 * 게시글 상세/생성/수정 페이지 상단에 사용.
 */
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

interface BackLinkProps {
  /** 링크 텍스트 (기본: "Back to list") */
  text?: string;
  to?: string;
}

const Wrapper = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 13px;
    gap: 6px;
  }
`;

export default function BackLink({ text = 'Back to list', to = '/boards' }: BackLinkProps) {
  const navigate = useNavigate();

  return (
    <Wrapper onClick={() => navigate(to)}>
      <span>←</span>
      <span>{text}</span>
    </Wrapper>
  );
}
