'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { onboardingStorage } from '../../storage';
import { getFirstUnfinishedStep } from '../steps';

/**
 * Sends a visitor who opened the flow root to the first step they have not finished. Storage exists
 * only in the browser, so the read runs in an effect rather than during render.
 */
export function useFlowEntry(): void {
  const router = useRouter();

  useEffect(() => {
    router.replace(getFirstUnfinishedStep(onboardingStorage.getSnapshot()).path);
  }, [router]);
}
