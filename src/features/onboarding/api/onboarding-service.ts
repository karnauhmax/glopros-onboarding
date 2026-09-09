import type { OnboardingService } from './types';

export const MOCK_TRIGGERS = {
  takenEmail: 'taken@example.com',
  outageEmail: 'outage@example.com',
  failingFileNamePart: 'fail',
} as const;

const MOCK_LATENCY_MS = 700;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

let userCounter = 0;
let fileCounter = 0;

export const onboardingService: OnboardingService = {
  async register(request) {
    await delay(MOCK_LATENCY_MS);

    if (request.email === MOCK_TRIGGERS.outageEmail) {
      throw new Error('Network error');
    }

    if (request.email === MOCK_TRIGGERS.takenEmail) {
      return { status: 'error', fieldErrors: { email: 'This email is already registered' } };
    }

    return { status: 'ok', userId: `user-${++userCounter}` };
  },

  async uploadCv(request) {
    await delay(MOCK_LATENCY_MS);

    const fileName = request.file.name;

    if (fileName.toLowerCase().includes(MOCK_TRIGGERS.failingFileNamePart)) {
      return { status: 'error', fileName, message: 'Upload failed. Please try again.' };
    }

    return { status: 'ok', fileId: `file-${++fileCounter}`, fileName };
  },
};
