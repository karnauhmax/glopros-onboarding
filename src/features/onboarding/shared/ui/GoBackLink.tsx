'use client';

import NextLink from 'next/link';
import styled from 'styled-components';

import { linkStyle } from '@/styles/link-style';
import { textStyle } from '@/styles/text-style';

import { getNextStep, getPreviousStep, useCurrentStep } from '../model';

const BackLink = styled(NextLink)`
  ${textStyle('link')};
  ${linkStyle};
`;

export function GoBackLink() {
  const { step } = useCurrentStep();

  if (!step || !getNextStep(step.id)) {
    return null;
  }

  const previous = getPreviousStep(step.id);

  return previous ? <BackLink href={previous.path}>Go back</BackLink> : null;
}
