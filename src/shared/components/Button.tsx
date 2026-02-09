/**
 * 공통 버튼 컴포넌트.
 *
 * variant로 4가지 스타일(primary, outline, destructive, ghost)을 지원한다.
 * 디자인 시스템의 cornerRadius 8, padding [12,24], fontSize 14를 기본으로 따른다.
 */
import styled, { css } from 'styled-components';
import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'destructive' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: css`
    background: ${({ theme }) => theme.colors.accentPrimary};
    color: ${({ theme }) => theme.colors.textOnAccent};
    font-weight: 600;
    &:hover { background: ${({ theme }) => theme.colors.accentHover}; }
  `,
  outline: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: 500;
    border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
    &:hover { background: ${({ theme }) => theme.colors.bgMuted}; }
  `,
  destructive: css`
    background: ${({ theme }) => theme.colors.destructive};
    color: ${({ theme }) => theme.colors.textOnAccent};
    font-weight: 600;
    &:hover { opacity: 0.9; }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.accentPrimary};
    font-weight: 500;
    &:hover { background: ${({ theme }) => theme.colors.accentSubtle}; }
  `,
};

const StyledButton = styled.button<{ $variant: ButtonVariant; $fullWidth: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-family: ${({ theme }) => theme.fonts.primary};
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease;
  border: none;
  white-space: nowrap;

  ${({ $variant }) => variantStyles[$variant]}
  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function Button({ variant = 'primary', fullWidth = false, children, ...rest }: ButtonProps) {
  return (
    <StyledButton $variant={variant} $fullWidth={fullWidth} {...rest}>
      {children}
    </StyledButton>
  );
}
