'use client';

import type { AnchorHTMLAttributes } from 'react';
import styled from 'styled-components';

import { linkStyle } from '@/styles/link-style';

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'rel' | 'target'> {
  external?: boolean;
}

const Anchor = styled.a`
  ${linkStyle};
  font: inherit;
`;

export function Link({ external = false, ...rest }: LinkProps) {
  if (!external) {
    return <Anchor {...rest} />;
  }

  return <Anchor {...rest} target="_blank" rel="noopener noreferrer" />;
}
