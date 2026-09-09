import { createCvFileFixture } from '@/test-utils/fixtures';

import { MOCK_TRIGGERS, onboardingService } from '../onboarding-service';
import { createCvUploadRequestFixture, createRegistrationRequestFixture } from './fixtures';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('onboardingService.register', () => {
  it('keeps the caller waiting until the mocked latency has passed', async () => {
    const answered = jest.fn();
    void onboardingService.register(createRegistrationRequestFixture()).then(answered);

    await jest.advanceTimersByTimeAsync(699);

    expect(answered).not.toHaveBeenCalled();
  });

  it('answers once the mocked latency has passed', async () => {
    const answered = jest.fn();
    void onboardingService.register(createRegistrationRequestFixture()).then(answered);

    await jest.advanceTimersByTimeAsync(700);

    expect(answered).toHaveBeenCalledTimes(1);
  });

  it('rejects the address that stands for an email already registered', async () => {
    const pending = onboardingService.register(
      createRegistrationRequestFixture({ email: MOCK_TRIGGERS.takenEmail }),
    );

    await jest.advanceTimersByTimeAsync(700);

    await expect(pending).resolves.toStrictEqual({
      status: 'error',
      fieldErrors: { email: 'This email is already registered' },
    });
  });

  it('throws for the address that stands for an outage', async () => {
    const rejection = onboardingService
      .register(createRegistrationRequestFixture({ email: MOCK_TRIGGERS.outageEmail }))
      .catch((error: Error) => error.message);

    await jest.advanceTimersByTimeAsync(700);

    await expect(rejection).resolves.toBe('Network error');
  });

  it('registers any other address and issues a user id', async () => {
    const pending = onboardingService.register(createRegistrationRequestFixture());

    await jest.advanceTimersByTimeAsync(700);

    await expect(pending).resolves.toStrictEqual({
      status: 'ok',
      userId: expect.stringMatching(/^user-\d+$/),
    });
  });
});

describe('onboardingService.uploadCv', () => {
  it('keeps the caller waiting until the mocked latency has passed', async () => {
    const answered = jest.fn();
    void onboardingService.uploadCv(createCvUploadRequestFixture()).then(answered);

    await jest.advanceTimersByTimeAsync(699);

    expect(answered).not.toHaveBeenCalled();
  });

  it('refuses a file whose name marks it as failing', async () => {
    const pending = onboardingService.uploadCv(
      createCvUploadRequestFixture(createCvFileFixture('fail-cv.pdf')),
    );

    await jest.advanceTimersByTimeAsync(700);

    await expect(pending).resolves.toStrictEqual({
      status: 'error',
      fileName: 'fail-cv.pdf',
      message: 'Upload failed. Please try again.',
    });
  });

  it('refuses a failing name whatever its case', async () => {
    const pending = onboardingService.uploadCv(
      createCvUploadRequestFixture(createCvFileFixture('FAIL-cv.pdf')),
    );

    await jest.advanceTimersByTimeAsync(700);

    await expect(pending).resolves.toStrictEqual({
      status: 'error',
      fileName: 'FAIL-cv.pdf',
      message: 'Upload failed. Please try again.',
    });
  });

  it('uploads any other file and issues a file id under its own name', async () => {
    const pending = onboardingService.uploadCv(
      createCvUploadRequestFixture(createCvFileFixture('resume.pdf')),
    );

    await jest.advanceTimersByTimeAsync(700);

    await expect(pending).resolves.toStrictEqual({
      status: 'ok',
      fileId: expect.stringMatching(/^file-\d+$/),
      fileName: 'resume.pdf',
    });
  });
});
