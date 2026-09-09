'use client';

import { type IconProps, SvgIcon } from './SvgIcon';

export function ChevronDownIcon(props: IconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 20 20" naturalSize={20} strokeWidth={1.66667}>
      <path d="M5 7.5L10 12.5L15 7.5" />
    </SvgIcon>
  );
}
