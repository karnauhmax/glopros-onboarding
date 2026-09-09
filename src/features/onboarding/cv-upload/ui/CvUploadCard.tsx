'use client';

import type { MouseEvent } from 'react';
import styled from 'styled-components';

import { FileName } from '@/features/onboarding/shared';
import { linkStyle } from '@/styles/link-style';
import { textStyle } from '@/styles/text-style';

export interface CvUploadCardProps {
  fileName: string;
  description: string;
  tone: 'success' | 'error';
  descriptionId?: string;
  onRemove(): void;
}

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[6]};
  text-align: center;
`;

const Outcome = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[6]};
`;

const Description = styled.p<{ $tone: 'success' | 'error' }>`
  ${textStyle('bodyM')};
  margin: 0;
  color: ${({ theme, $tone }) =>
    $tone === 'error' ? theme.colors.text.error : theme.colors.text.secondary};
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const Action = styled.button`
  ${textStyle('link')};
  ${linkStyle};
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
`;

const ICONS = {
  success: '/icons/upload-success.svg',
  error: '/icons/upload-error.svg',
} as const;

export function CvUploadCard({
  fileName,
  description,
  tone,
  descriptionId,
  onRemove,
}: CvUploadCardProps) {
  const handleRemove = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove();
  };

  return (
    <Card>
      <Outcome role={tone === 'error' ? 'alert' : 'status'}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, next/image adds nothing */}
        <img src={ICONS[tone]} alt="" width={50} height={50} />
        <FileName>{fileName}</FileName>
        <Description id={descriptionId} $tone={tone}>
          {description}
        </Description>
      </Outcome>
      <Actions>
        <Action type="button">Replace</Action>
        <Action type="button" onClick={handleRemove}>
          Remove
        </Action>
      </Actions>
    </Card>
  );
}
