import { act, createRouterMock, renderHook, waitFor } from '@/test-utils';

import { useCompletion } from '../useCompletion';

const mockRouter = createRouterMock();

jest.mock('next/navigation', () => ({ useRouter: () => mockRouter }));

const storeCvUpload = () =>
  sessionStorage.setItem(
    'onboarding.cvUpload',
    JSON.stringify({ fileId: 'file-1', fileName: 'cv.pdf' }),
  );

describe('useCompletion', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('reads the name of the uploaded CV out of storage', async () => {
    storeCvUpload();

    const { result } = renderHook(() => useCompletion());

    await waitFor(() => expect(result.current.fileName).toBe('cv.pdf'));
  });

  it('reports no file name when nothing was uploaded', async () => {
    const { result } = renderHook(() => useCompletion());

    await waitFor(() => expect(result.current.fileName).toBeNull());
  });

  it('leaves the stored flow in place until the user finishes', async () => {
    storeCvUpload();

    const { result } = renderHook(() => useCompletion());
    await waitFor(() => expect(result.current.fileName).toBe('cv.pdf'));

    expect(sessionStorage.getItem('onboarding.cvUpload')).not.toBeNull();
  });

  it('empties the storage when the user finishes', () => {
    sessionStorage.setItem('onboarding.registration', JSON.stringify({ userId: 'user-1' }));
    sessionStorage.setItem(
      'onboarding.draft',
      JSON.stringify({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: { country: 'NL', number: '612345678' },
        termsAccepted: true,
      }),
    );
    storeCvUpload();
    const { result } = renderHook(() => useCompletion());

    act(() => {
      result.current.finish();
    });

    expect(sessionStorage.getItem('onboarding.draft')).toBeNull();
    expect(sessionStorage.getItem('onboarding.registration')).toBeNull();
    expect(sessionStorage.getItem('onboarding.cvUpload')).toBeNull();
  });

  it('sends the user home when they finish', () => {
    const { result } = renderHook(() => useCompletion());

    act(() => {
      result.current.finish();
    });

    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});
