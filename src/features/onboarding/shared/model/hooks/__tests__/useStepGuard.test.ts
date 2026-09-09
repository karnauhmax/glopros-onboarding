import { createRouterMock, renderHook } from '@/test-utils';

import type { OnboardingSnapshot } from '../../../storage';
import { useStepGuard } from '../useStepGuard';

const mockRouter = createRouterMock();
let mockPathname = '/onboarding/sign-up';
let mockSnapshot: OnboardingSnapshot = { registration: null, cvUpload: null };

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => mockRouter,
}));

jest.mock('../../../storage', () => ({
  onboardingStorage: { getSnapshot: () => mockSnapshot },
}));

describe('useStepGuard', () => {
  beforeEach(() => {
    mockPathname = '/onboarding/sign-up';
    mockSnapshot = { registration: null, cvUpload: null };
  });

  it('sends a visitor of a later step back to the first unfinished one', () => {
    mockPathname = '/onboarding/success';

    renderHook(() => useStepGuard());

    expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding/sign-up');
    expect(mockRouter.replace).toHaveBeenCalledTimes(1);
  });

  it('leaves a visitor of the first step where they are', () => {
    renderHook(() => useStepGuard());

    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('lets a registered visitor open the CV upload step', () => {
    mockSnapshot = { registration: { userId: 'user-1' }, cvUpload: null };
    mockPathname = '/onboarding/cv-upload';

    renderHook(() => useStepGuard());

    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('ignores a route that is not a step of the flow', () => {
    mockPathname = '/profile';

    renderHook(() => useStepGuard());

    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('checks the step again when the pathname changes', () => {
    const { rerender } = renderHook(() => useStepGuard());

    mockPathname = '/onboarding/success';
    rerender();

    expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding/sign-up');
  });
});
