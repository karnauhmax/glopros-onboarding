'use client';

import { usePathname } from 'next/navigation';

import { getStepByPath, getStepIndex, type Step, steps } from '../steps';

/** The current step comes from the URL, not from storage, so the progress bar follows the route. */
export function useCurrentStep(): { step: Step | undefined; index: number; total: number } {
  const pathname = usePathname();
  const step = getStepByPath(pathname);

  return { step, index: step ? getStepIndex(step.id) : -1, total: steps.length };
}
