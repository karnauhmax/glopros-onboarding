'use client';

import type { ReactNode } from 'react';
import styled from 'styled-components';

import { useStepGuard } from '../model';
import { GoBackLink } from './GoBackLink';
import { ProgressHeader } from './ProgressHeader';

export interface OnboardingLayoutProps {
  children: ReactNode;
}

const Shell = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.default};
`;

const Main = styled.main`
  display: flex;
  min-height: calc(100vh - ${({ theme }) => theme.sizes.navbarHeight});
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[6]};
  padding: ${({ theme }) => theme.spacing[10]} 0;
`;

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  useStepGuard();

  return (
    <Shell>
      <ProgressHeader />
      <Main>
        {children}
        <GoBackLink />
      </Main>
    </Shell>
  );
}
