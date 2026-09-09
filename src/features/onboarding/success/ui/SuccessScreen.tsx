'use client';

import styled from 'styled-components';

import { CV_PREFILL_NOTE, FileName, StepContent, StepHeading } from '@/features/onboarding/shared';
import { Button } from '@/shared/ui';
import { textStyle } from '@/styles/text-style';

import { useCompletion } from '../model';

const Card = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[6]};
  padding: ${({ theme }) => theme.spacing[10]} ${({ theme }) => theme.spacing[6]};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.background.default};
`;

const Description = styled.p`
  ${textStyle('bodyM')};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export function SuccessScreen() {
  const { fileName, finish } = useCompletion();

  return (
    <StepContent>
      <StepHeading
        title="Your account is ready"
        subtitle="Your GloPros profile is set up and your CV is on file."
      />
      <Card>
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, next/image adds nothing */}
        <img src="/icons/upload-success.svg" alt="" width={50} height={50} />
        {fileName ? <FileName>{fileName}</FileName> : null}
        <Description>{CV_PREFILL_NOTE}</Description>
      </Card>
      <Button onClick={finish}>Finish</Button>
    </StepContent>
  );
}
