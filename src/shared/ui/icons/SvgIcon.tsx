'use client';

import type { ReactNode, SVGAttributes } from 'react';

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  size?: number;
  title?: string;
}

interface SvgIconProps extends IconProps {
  viewBox: string;
  naturalSize: number;
  strokeWidth: number;
  children: ReactNode;
}

export function SvgIcon({
  viewBox,
  naturalSize,
  strokeWidth,
  size,
  title,
  children,
  ...rest
}: SvgIconProps) {
  const side = size ?? naturalSize;

  return (
    <svg
      {...rest}
      viewBox={viewBox}
      width={side}
      height={side}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title === undefined ? undefined : 'img'}
      aria-hidden={title === undefined ? 'true' : undefined}
    >
      {title === undefined ? null : <title>{title}</title>}
      {children}
    </svg>
  );
}
