import type { z } from 'zod';

import {
  type CvUpload,
  cvUploadSchema,
  type Draft,
  draftSchema,
  type Registration,
  registrationSchema,
} from './schemas';

const DRAFT_KEY = 'onboarding.draft';
const REGISTRATION_KEY = 'onboarding.registration';
const CV_KEY = 'onboarding.cvUpload';

export interface OnboardingSnapshot {
  registration: Registration | null;
  cvUpload: CvUpload | null;
}

export interface OnboardingStorage {
  readDraft(): Draft | null;
  saveDraft(draft: Draft): void;
  readRegistration(): Registration | null;
  saveRegistration(registration: Registration): void;
  readCvUpload(): CvUpload | null;
  saveCvUpload(cvUpload: CvUpload): void;
  clearCvUpload(): void;
  getSnapshot(): OnboardingSnapshot;
  clear(): void;
}

// getItem returns null for a missing key, JSON.parse turns that back into null, and the schema
// rejects it. "Nothing stored", "not JSON" and "another shape" all end up as null.
function read<T>(key: string, schema: z.ZodType<T>): T | null {
  try {
    const result = schema.safeParse(JSON.parse(window.sessionStorage.getItem(key) as string));

    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, schema: z.ZodType<T>, value: T): void {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(schema.parse(value)));
  } catch {
    // A full quota or a browser that blocks storage must not break the form. The form keeps its
    // values in memory and the user sees nothing.
  }
}

function remove(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch {}
}

function readDraft(): Draft | null {
  return read(DRAFT_KEY, draftSchema);
}

// The draft holds form values, not flow progress, so it stays out of the snapshot.
function saveDraft(draft: Draft): void {
  write(DRAFT_KEY, draftSchema, draft);
}

function readRegistration(): Registration | null {
  return read(REGISTRATION_KEY, registrationSchema);
}

function saveRegistration(registration: Registration): void {
  write(REGISTRATION_KEY, registrationSchema, registration);
}

function readCvUpload(): CvUpload | null {
  return read(CV_KEY, cvUploadSchema);
}

function saveCvUpload(cvUpload: CvUpload): void {
  write(CV_KEY, cvUploadSchema, cvUpload);
}

function clearCvUpload(): void {
  remove(CV_KEY);
}

/**
 * The flow's progress, read fresh from storage. Call it from an effect or an event handler, never
 * during render, because storage exists only in the browser.
 */
function getSnapshot(): OnboardingSnapshot {
  return { registration: readRegistration(), cvUpload: readCvUpload() };
}

function clear(): void {
  remove(DRAFT_KEY);
  remove(REGISTRATION_KEY);
  remove(CV_KEY);
}

/** The only module that touches session storage. Swap this object to store the flow elsewhere. */
export const onboardingStorage: OnboardingStorage = {
  readDraft,
  saveDraft,
  readRegistration,
  saveRegistration,
  readCvUpload,
  saveCvUpload,
  clearCvUpload,
  getSnapshot,
  clear,
};
