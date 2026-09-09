'use client';

import type { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

import { textStyle } from '@/styles/text-style';

import { Spinner } from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'lg' | 'md';
  loading?: boolean;
}

const StyledButton = styled.button<{ $size: 'lg' | 'md' }>`
  ${textStyle('button')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  border: 0;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.button.primaryBg};
  color: ${({ theme }) => theme.colors.text.inverse};
  cursor: pointer;
  height: ${({ $size }) => ($size === 'lg' ? '56px' : '40px')};
  padding: ${({ $size, theme }) =>
    $size === 'lg'
      ? `${theme.spacing[2.5]} ${theme.spacing[6]}`
      : `${theme.spacing[2]} ${theme.spacing[5]}`};
  transition: background-color ${({ theme }) => theme.transitions.fast};

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.button.primaryHover};
    }
  }

  &:active:not(:disabled) {
    background: ${({ theme }) => theme.colors.button.primaryActive};
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

export function Button({
  size = 'lg',
  loading = false,
  type = 'button',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <StyledButton
      {...rest}
      type={type}
      $size={size}
      disabled={disabled || loading}
      aria-busy={loading ? 'true' : undefined}
    >
      {loading ? <Spinner size={16} /> : null}
      {children}
    </StyledButton>
  );
}
