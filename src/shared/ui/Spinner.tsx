'use client';

import type { HTMLAttributes } from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Ring = styled.span<{ $size: number }>`
  display: inline-block;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

export function Spinner({ size = 16, ...rest }: SpinnerProps) {
  return <Ring {...rest} $size={size} aria-hidden="true" />;
}
