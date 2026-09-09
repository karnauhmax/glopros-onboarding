'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { onboardingStorage } from '../../storage';
import { canVisit, getFirstUnfinishedStep, getStepByPath } from '../steps';

/**
 * Sends a visitor who jumped ahead back to the first unfinished step. Storage exists only in the
 * browser, so the check runs in an effect on every new route.
 */
export function useStepGuard(): void {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const step = getStepByPath(pathname);
    const snapshot = onboardingStorage.getSnapshot();

    if (step && !canVisit(step, snapshot)) {
      router.replace(getFirstUnfinishedStep(snapshot).path);
    }
  }, [pathname, router]);
}
