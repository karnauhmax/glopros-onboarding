'use client';

import type { HTMLAttributes } from 'react';
import styled from 'styled-components';

import { textStyle } from '@/styles/text-style';

export interface FormErrorProps extends HTMLAttributes<HTMLParagraphElement> {}

export const ErrorMessage = styled.p`
  ${textStyle('bodyS')};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.error};
`;

export function FormError({ children, ...rest }: FormErrorProps) {
  if (!children) {
    return null;
  }

  return (
    <ErrorMessage {...rest} role="alert">
      {children}
    </ErrorMessage>
  );
}
