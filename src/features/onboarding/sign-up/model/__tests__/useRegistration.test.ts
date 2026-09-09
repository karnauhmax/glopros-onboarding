import type { RegistrationResponse } from '@/features/onboarding/api';
import { onboardingService } from '@/features/onboarding/api';
import { act, createDeferred, createRouterMock, renderHook, waitFor } from '@/test-utils';

import { createSignUpFormValuesFixture } from '../../__tests__/fixtures';
import { useRegistration } from '../useRegistration';

const mockRouter = createRouterMock();

jest.mock('@/features/onboarding/api');
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/onboarding/sign-up',
}));

const registerMock = jest.mocked(onboardingService.register);

const readDraft = () => JSON.parse(sessionStorage.getItem('onboarding.draft') as string);

async function submitValid(result: { current: ReturnType<typeof useRegistration> }) {
  act(() => {
    result.current.form.reset(createSignUpFormValuesFixture());
  });

  await act(() => result.current.form.handleSubmit(result.current.onSubmit)());
}

describe('useRegistration', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('restores a stored draft into the form and leaves the passwords empty', async () => {
    sessionStorage.setItem(
      'onboarding.draft',
      JSON.stringify({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: { country: 'PL', number: '512345678' },
        termsAccepted: true,
      }),
    );

    const { result } = renderHook(() => useRegistration());

    await waitFor(() =>
      expect(result.current.form.getValues()).toStrictEqual({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: { country: 'PL', number: '512345678' },
        password: '',
        confirmPassword: '',
        termsAccepted: true,
      }),
    );
  });

  it('starts from empty values when storage holds another shape', async () => {
    sessionStorage.setItem('onboarding.draft', '{"nickname":"Ada"}');

    const { result } = renderHook(() => useRegistration());

    await waitFor(() =>
      expect(result.current.form.getValues()).toStrictEqual({
        firstName: '',
        lastName: '',
        email: '',
        phone: { country: 'NL', number: '' },
        password: '',
        confirmPassword: '',
        termsAccepted: false,
      }),
    );
  });

  it('writes a changed value to the draft', async () => {
    const { result } = renderHook(() => useRegistration());

    act(() => {
      result.current.form.setValue('email', 'ada@');
    });

    await waitFor(() =>
      expect(readDraft()).toStrictEqual(expect.objectContaining({ email: 'ada@' })),
    );
  });

  it('never writes a password to the draft', async () => {
    const { result } = renderHook(() => useRegistration());

    act(() => {
      result.current.form.setValue('password', 'Password1');
    });

    await waitFor(() => expect(readDraft()).not.toHaveProperty('password'));
  });

  it('sends the normalized request to the service once', async () => {
    registerMock.mockResolvedValue({ status: 'ok', userId: 'user-1' });
    const { result } = renderHook(() => useRegistration());

    act(() => {
      result.current.form.reset(
        createSignUpFormValuesFixture({
          firstName: '  Ada  ',
          lastName: ' Lovelace ',
          email: ' ada@example.com ',
          phone: { country: 'NL', number: '6 12 34 56 78' },
        }),
      );
    });
    await act(() => result.current.form.handleSubmit(result.current.onSubmit)());

    expect(registerMock).toHaveBeenCalledTimes(1);
    expect(registerMock).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: { country: 'NL', number: '612345678' },
      password: 'Password1',
      termsAccepted: true,
    });
  });

  it('stores the user id and moves on to the next step after a successful registration', async () => {
    registerMock.mockResolvedValue({ status: 'ok', userId: 'user-1' });
    const { result } = renderHook(() => useRegistration());

    await submitValid(result);

    expect(sessionStorage.getItem('onboarding.registration')).toBe('{"userId":"user-1"}');
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith('/onboarding/cv-upload');
  });

  it('drops a CV the previous registration uploaded and sends the user back to the upload step', async () => {
    sessionStorage.setItem(
      'onboarding.cvUpload',
      JSON.stringify({ fileId: 'file-1', fileName: 'cv.pdf' }),
    );
    registerMock.mockResolvedValue({ status: 'ok', userId: 'user-2' });
    const { result } = renderHook(() => useRegistration());

    await submitValid(result);

    expect(sessionStorage.getItem('onboarding.cvUpload')).toBeNull();
    expect(mockRouter.push).toHaveBeenCalledWith('/onboarding/cv-upload');
  });

  it('shows a rejected email on the email field', async () => {
    registerMock.mockResolvedValue({
      status: 'error',
      fieldErrors: { email: 'This email is already registered' },
    });
    const { result } = renderHook(() => useRegistration());

    await submitValid(result);

    expect(result.current.form.getFieldState('email').error).toEqual({
      type: 'server',
      message: 'This email is already registered',
    });
  });

  it('clears a rejected email once the user changes it', async () => {
    registerMock.mockResolvedValue({
      status: 'error',
      fieldErrors: { email: 'This email is already registered' },
    });
    const { result } = renderHook(() => useRegistration());
    await submitValid(result);

    await act(() =>
      result.current.form.setValue('email', 'other@example.com', { shouldValidate: true }),
    );

    expect(result.current.form.getFieldState('email').error).toBeUndefined();
  });

  it('leaves the form banner empty and stays on the step when a field is rejected', async () => {
    registerMock.mockResolvedValue({
      status: 'error',
      fieldErrors: { email: 'This email is already registered' },
    });
    const { result } = renderHook(() => useRegistration());

    await submitValid(result);

    expect(result.current.formError).toBeNull();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('falls back to the form banner when the rejection names no field this form has', async () => {
    registerMock.mockResolvedValue({ status: 'error', fieldErrors: {} });
    const { result } = renderHook(() => useRegistration());

    await submitValid(result);

    expect(result.current.formError).toBe('Something went wrong. Please try again.');
  });

  it('shows a rejected phone on the phone number', async () => {
    registerMock.mockResolvedValue({
      status: 'error',
      fieldErrors: { phone: 'This phone number is already registered' },
    });
    const { result } = renderHook(() => useRegistration());

    await submitValid(result);

    expect(result.current.form.getFieldState('phone.number').error).toEqual({
      type: 'server',
      message: 'This phone number is already registered',
    });
  });

  it('shows a rejected password on the password field', async () => {
    registerMock.mockResolvedValue({
      status: 'error',
      fieldErrors: { password: 'This password is too common' },
    });
    const { result } = renderHook(() => useRegistration());

    await submitValid(result);

    expect(result.current.form.getFieldState('password').error).toEqual({
      type: 'server',
      message: 'This password is too common',
    });
  });

  it('shows the generic message and never the transport error when the request throws', async () => {
    registerMock.mockRejectedValue(new Error('Failed to fetch'));
    const { result } = renderHook(() => useRegistration());

    await submitValid(result);

    expect(result.current.formError).toBe('Something went wrong. Please try again.');
  });

  it('shows the message of a failed response in the form banner', async () => {
    registerMock.mockResolvedValue({ status: 'error', message: 'Nope' });
    const { result } = renderHook(() => useRegistration());

    await submitValid(result);

    expect(result.current.formError).toBe('Nope');
  });

  it('clears the form banner when the next attempt starts', async () => {
    const secondAttempt = createDeferred<RegistrationResponse>();
    registerMock.mockResolvedValueOnce({ status: 'error', message: 'Nope' });
    registerMock.mockReturnValueOnce(secondAttempt.promise);
    const { result } = renderHook(() => useRegistration());
    await submitValid(result);

    await act(async () => {
      void result.current.form.handleSubmit(result.current.onSubmit)();
    });

    expect(result.current.formError).toBeNull();
  });

  it('leaves an empty confirmation without an error when the password changes', async () => {
    const { result } = renderHook(() => useRegistration());
    act(() => {
      result.current.form.reset(createSignUpFormValuesFixture({ confirmPassword: '' }));
    });

    await act(async () => {
      result.current.form.setValue('password', 'Password2');
    });

    expect(result.current.form.getFieldState('confirmPassword').error).toBeUndefined();
  });

  it('re-checks a restored confirmation the user never touched when the password changes', async () => {
    const { result } = renderHook(() => useRegistration());
    act(() => {
      result.current.form.reset(createSignUpFormValuesFixture());
    });

    act(() => {
      result.current.form.setValue('password', 'Password2');
    });

    await waitFor(() =>
      expect(result.current.form.getFieldState('confirmPassword').error?.message).toBe(
        'Passwords do not match',
      ),
    );
  });

  it('re-checks a restored phone number the user never touched when the country changes', async () => {
    const { result } = renderHook(() => useRegistration());
    act(() => {
      result.current.form.reset(
        createSignUpFormValuesFixture({ phone: { country: 'NL', number: '0612345678' } }),
      );
    });

    act(() => {
      result.current.form.setValue('phone.country', 'PL');
    });

    await waitFor(() =>
      expect(result.current.form.getFieldState('phone.number').error?.message).toBe(
        'Enter a valid phone number for Poland',
      ),
    );
  });
});
