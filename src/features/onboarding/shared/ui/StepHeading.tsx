'use client';

import styled from 'styled-components';

import { textStyle } from '@/styles/text-style';

export interface StepHeadingProps {
  title: string;
  subtitle?: string;
}

const Heading = styled.header`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  text-align: center;
`;

const Title = styled.h1`
  ${textStyle('h4')};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.heading};
`;

const Subtitle = styled.p`
  ${textStyle('bodyL')};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.subtitle};
`;

export function StepHeading({ title, subtitle }: StepHeadingProps) {
  return (
    <Heading>
      <Title>{title}</Title>
      {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
    </Heading>
  );
}
