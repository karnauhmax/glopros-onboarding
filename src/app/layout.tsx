import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { fontClassName } from '@/styles/fonts';
import { StyledComponentsRegistry } from '@/styles/styled-components-registry';
import { AppThemeProvider } from '@/styles/theme-provider';

export const metadata: Metadata = {
  title: 'GloPros Onboarding',
  description: 'Onboarding flow: sign up, CV upload, success',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontClassName}>
      <body>
        <StyledComponentsRegistry>
          <AppThemeProvider>{children}</AppThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
