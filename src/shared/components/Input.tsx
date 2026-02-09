/**
 * InputGroup 컴포넌트 (Label + Input + Error).
 *
 * 디자인의 InputGroup 구조를 그대로 반영한다.
 * height 44px, cornerRadius 8, padding [12,16], border 1px.
 */
import styled from 'styled-components';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
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

const StyledInput = styled.input<{ $hasError: boolean }>`
  height: 44px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme, $hasError }) =>
    $hasError ? theme.colors.error : theme.colors.borderPrimary};
  background: ${({ theme }) => theme.colors.bgInput};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  width: 100%;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accentPrimary};
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
`;

export default function Input({ label, error, id, ...rest }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <Wrapper>
      <Label htmlFor={inputId}>{label}</Label>
      <StyledInput id={inputId} $hasError={!!error} {...rest} />
      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
}
