'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { onboardingStorage } from '@/features/onboarding/shared';

export function useCompletion(): { fileName: string | null; finish(): void } {
  const router = useRouter();
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- storage exists only in the browser, so the read waits for the effect and sets state once
    setFileName(onboardingStorage.readCvUpload()?.fileName ?? null);
  }, []);

  const finish = useCallback(() => {
    onboardingStorage.clear();
    router.push('/');
  }, [router]);

  return { fileName, finish };
}
