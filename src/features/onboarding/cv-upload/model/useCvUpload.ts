'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { onboardingService } from '@/features/onboarding/api';
import { GENERIC_ERROR_MESSAGE, onboardingStorage } from '@/features/onboarding/shared';

import { validateCvFile } from '../validation';

export type CvUploadState =
  | { kind: 'empty' }
  | { kind: 'uploading'; fileName: string }
  | { kind: 'success'; fileId: string; fileName: string }
  | { kind: 'error'; fileName: string; message: string };

export function useCvUpload(): {
  state: CvUploadState;
  selectFile(file: File): Promise<void>;
  remove(): void;
} {
  const [state, setState] = useState<CvUploadState>({ kind: 'empty' });
  const activeUpload = useRef<symbol | null>(null);

  useEffect(() => {
    const stored = onboardingStorage.readCvUpload();

    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage exists only in the browser, so the restore waits for the effect and sets state once
      setState({ kind: 'success', fileId: stored.fileId, fileName: stored.fileName });
    }

    return () => {
      activeUpload.current = null;
    };
  }, []);

  const selectFile = useCallback(async (file: File) => {
    const token = Symbol('cv-upload');

    activeUpload.current = token;
    onboardingStorage.clearCvUpload();

    const message = validateCvFile(file);

    if (message) {
      setState({ kind: 'error', fileName: file.name, message });

      return;
    }

    const registration = onboardingStorage.readRegistration();

    if (!registration) {
      setState({ kind: 'error', fileName: file.name, message: GENERIC_ERROR_MESSAGE });

      return;
    }

    setState({ kind: 'uploading', fileName: file.name });

    const response = await onboardingService.uploadCv({ userId: registration.userId, file });

    if (activeUpload.current !== token) {
      return;
    }

    if (response.status === 'ok') {
      onboardingStorage.saveCvUpload({ fileId: response.fileId, fileName: response.fileName });
      setState({ kind: 'success', fileId: response.fileId, fileName: response.fileName });

      return;
    }

    setState({ kind: 'error', fileName: response.fileName, message: response.message });
  }, []);

  const remove = useCallback(() => {
    activeUpload.current = null;
    onboardingStorage.clearCvUpload();
    setState({ kind: 'empty' });
  }, []);

  return { state, selectFile, remove };
}
