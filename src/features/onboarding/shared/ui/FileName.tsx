'use client';

import styled from 'styled-components';

import { textStyle } from '@/styles/text-style';

export const FileName = styled.p`
  ${textStyle('h6')};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.heading};
`;
