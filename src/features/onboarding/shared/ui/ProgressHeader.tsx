'use client';

import styled from 'styled-components';

import { ProgressBar } from '@/shared/ui';

import { useCurrentStep } from '../model';

const Header = styled.header`
  position: relative;
  height: ${({ theme }) => theme.sizes.navbarHeight};
  background: ${({ theme }) => theme.colors.background.default};
`;

const Logo = styled.span`
  position: absolute;
  top: 26px;
  left: 111px;
  display: inline-flex;
`;

const Progress = styled(ProgressBar)`
  position: absolute;
  top: 87px;
  right: 0;
  left: 0;
`;

export function ProgressHeader() {
  const { index, total } = useCurrentStep();

  return (
    <Header>
      <Logo>
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, next/image adds nothing */}
        <img src="/logo.svg" alt="GloPros" width={149} height={32} />
      </Logo>
      <Progress
        value={index + 1}
        max={total}
        label="Onboarding progress"
        valueText={`Step ${index + 1} of ${total}`}
      />
    </Header>
  );
}
