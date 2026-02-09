/**
 * TextareaGroup 컴포넌트 (Label + Textarea).
 *
 * 디자인의 TextareaGroup을 반영. cornerRadius 8, padding [12,16], 기본 height 160px.
 */
import styled from 'styled-components';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const StyledTextarea = styled.textarea`
  min-height: 160px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  background: ${({ theme }) => theme.colors.bgInput};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  width: 100%;
  resize: vertical;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accentPrimary};
  }
`;

export default function Textarea({ label, id, ...rest }: TextareaProps) {
  const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <Wrapper>
      <Label htmlFor={textareaId}>{label}</Label>
      <StyledTextarea id={textareaId} {...rest} />
    </Wrapper>
  );
}
