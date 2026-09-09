'use client';

import type { HTMLAttributes } from 'react';
import styled from 'styled-components';

export interface ProgressBarProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'role' | 'aria-valuemin' | 'aria-valuemax' | 'aria-valuenow' | 'aria-valuetext' | 'aria-label'
> {
  value: number;
  max: number;
  label: string;
  valueText?: string;
}

const Track = styled.div`
  width: 100%;
  height: ${({ theme }) => theme.sizes.progressHeight};
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  overflow: hidden;
`;

const Fill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.gradients.progress};
  transition: width 300ms ease;
`;

export function ProgressBar({ value, max, label, valueText, ...props }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? (clamped / max) * 100 : 0;

  return (
    <Track
      {...props}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      aria-valuetext={valueText}
      aria-label={label}
    >
      <Fill style={{ width: `${percent}%` }} />
    </Track>
  );
}
