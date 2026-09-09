'use client';

import styled from 'styled-components';

export const StepContent = styled.div`
  display: flex;
  width: ${({ theme }) => theme.sizes.contentWidth};
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[6]};
`;
