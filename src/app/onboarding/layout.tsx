import type { ReactNode } from 'react';

import { OnboardingLayout } from '@/features/onboarding';

export default function Layout({ children }: { children: ReactNode }) {
  return <OnboardingLayout>{children}</OnboardingLayout>;
}
