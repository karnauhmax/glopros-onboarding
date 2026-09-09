import { renderHook } from '@/test-utils';

import { useCurrentStep } from '../useCurrentStep';

let mockPathname = '/onboarding/sign-up';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('useCurrentStep', () => {
  it('reads the current step from the pathname', () => {
    mockPathname = '/onboarding/cv-upload';

    const { result } = renderHook(() => useCurrentStep());

    expect(result.current.step?.id).toBe('cv-upload');
  });

  it('numbers the current step and the whole flow', () => {
    mockPathname = '/onboarding/cv-upload';

    const { result } = renderHook(() => useCurrentStep());

    expect(result.current.index).toBe(1);
    expect(result.current.total).toBe(3);
  });

  it('reports no step and an index of -1 outside the flow', () => {
    mockPathname = '/profile';

    const { result } = renderHook(() => useCurrentStep());

    expect(result.current.step).toBeUndefined();
    expect(result.current.index).toBe(-1);
  });
});
