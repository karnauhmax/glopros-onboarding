'use client';

import { type IconProps, SvgIcon } from './SvgIcon';

export function EyeIcon(props: IconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" naturalSize={20} strokeWidth={2}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </SvgIcon>
  );
}
