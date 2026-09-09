import { createCvFileFixture } from '@/test-utils/fixtures';

import type { CvUploadRequest, RegistrationRequest } from '../types';

export const createRegistrationRequestFixture = (
  overrides: Partial<RegistrationRequest> = {},
): RegistrationRequest => ({
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: { country: 'NL', number: '612345678' },
  password: 'Password1',
  termsAccepted: true,
  ...overrides,
});

export const createCvUploadRequestFixture = (
  file: File = createCvFileFixture(),
): CvUploadRequest => ({
  userId: 'user-1',
  file,
});
