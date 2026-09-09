import { createRouterMock, renderHook } from '@/test-utils';

import type { OnboardingSnapshot } from '../../../storage';
import { useFlowEntry } from '../useFlowEntry';

const mockRouter = createRouterMock();
let mockSnapshot: OnboardingSnapshot = { registration: null, cvUpload: null };

jest.mock('next/navigation', () => ({ useRouter: () => mockRouter }));

jest.mock('../../../storage', () => ({
  onboardingStorage: { getSnapshot: () => mockSnapshot },
}));

describe('useFlowEntry', () => {
  beforeEach(() => {
    mockSnapshot = { registration: null, cvUpload: null };
  });

  it('sends a new visitor to the sign up step', () => {
    renderHook(() => useFlowEntry());

    expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding/sign-up');
  });

  it('sends a registered visitor on to the CV upload step', () => {
    mockSnapshot = { registration: { userId: 'user-1' }, cvUpload: null };

    renderHook(() => useFlowEntry());

    expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding/cv-upload');
  });

  it('sends a visitor who uploaded a CV on to the success step', () => {
    mockSnapshot = {
      registration: { userId: 'user-1' },
      cvUpload: { fileId: 'file-1', fileName: 'cv.pdf' },
    };

    renderHook(() => useFlowEntry());

    expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding/success');
  });
});
