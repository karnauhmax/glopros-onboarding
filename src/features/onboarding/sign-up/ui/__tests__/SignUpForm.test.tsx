import userEvent from '@testing-library/user-event';

import { createRouterMock, renderWithTheme, screen, waitFor } from '@/test-utils';

import { SignUpForm } from '../SignUpForm';

const mockRouter = createRouterMock();
const mockRegister = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/onboarding/sign-up',
}));

jest.mock('../../../api', () => ({
  onboardingService: { register: (request: unknown) => mockRegister(request) },
}));

type User = ReturnType<typeof userEvent.setup>;

const TERMS_LABEL = 'I agree to the Terms of Service and Privacy Policy';

const storeDraft = (draft: unknown) =>
  sessionStorage.setItem('onboarding.draft', JSON.stringify(draft));

async function fillValidForm(user: User) {
  await user.type(screen.getByLabelText('First name'), 'Ada');
  await user.type(screen.getByLabelText('Last name'), 'Lovelace');
  await user.type(screen.getByLabelText('Phone number'), '612345678');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.type(screen.getByLabelText('Set password'), 'Password1');
  await user.type(screen.getByLabelText('Confirm password'), 'Password1');
  await user.click(screen.getByRole('checkbox', { name: TERMS_LABEL }));
}

async function submitValidForm(user: User) {
  await fillValidForm(user);
  const button = await screen.findByRole('button', { name: 'Create account' });
  await waitFor(() => expect(button).toBeEnabled());

  await user.click(button);
}

describe('SignUpForm', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('keeps the submit button disabled while the form is empty', async () => {
    renderWithTheme(<SignUpForm />);

    await expect(screen.findByRole('button', { name: 'Create account' })).resolves.toBeDisabled();
  });

  it('enables the submit button once every field is filled in and the terms are accepted', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SignUpForm />);

    await fillValidForm(user);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled(),
    );
  });

  it('holds back the email error until the field is left', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SignUpForm />);

    await user.type(screen.getByLabelText('Email'), 'ada@');

    expect(screen.queryByText('Enter a valid email address')).not.toBeInTheDocument();

    await user.tab();

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
  });

  it('drops the email error as soon as the address is complete', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SignUpForm />);
    await user.type(screen.getByLabelText('Email'), 'ada@');
    await user.tab();
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email'), 'example.com');

    await waitFor(() =>
      expect(screen.queryByText('Enter a valid email address')).not.toBeInTheDocument(),
    );
  });

  it('asks for the terms once the unticked box is left', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SignUpForm />);
    const checkbox = screen.getByRole('checkbox', { name: TERMS_LABEL });

    await user.click(screen.getByLabelText('Email'));
    checkbox.focus();
    await user.tab();

    expect(await screen.findByText('You must accept the terms')).toBeInTheDocument();
  });

  it('drops the terms error once the box is ticked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SignUpForm />);
    const checkbox = screen.getByRole('checkbox', { name: TERMS_LABEL });
    await user.click(screen.getByLabelText('Email'));
    checkbox.focus();
    await user.tab();
    expect(await screen.findByText('You must accept the terms')).toBeInTheDocument();

    await user.click(checkbox);

    await waitFor(() =>
      expect(screen.queryByText('You must accept the terms')).not.toBeInTheDocument(),
    );
  });

  it('opens both terms documents in a new tab', () => {
    renderWithTheme(<SignUpForm />);

    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute(
      'target',
      '_blank',
    );
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  it('locks every control while the registration is in flight', async () => {
    const user = userEvent.setup();
    mockRegister.mockReturnValue(new Promise(() => {}));
    renderWithTheme(<SignUpForm />);

    await submitValidForm(user);

    const [showPassword, showConfirmPassword] = screen.getAllByRole('button', {
      name: 'Show password',
    });

    await waitFor(() => expect(screen.getByLabelText('Email')).toBeDisabled());
    expect(screen.getByRole('combobox', { name: 'Country' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: TERMS_LABEL })).toBeDisabled();
    expect(showPassword).toBeDisabled();
    expect(showConfirmPassword).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Create account' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('does not register an invalid form when the user presses Enter in a field', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SignUpForm />);

    await user.type(screen.getByLabelText('Email'), 'ada@example.com{Enter}');

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create account' })).toBeDisabled(),
    );
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('registers once when the submit button is pressed twice in a row', async () => {
    const user = userEvent.setup();
    mockRegister.mockReturnValue(new Promise(() => {}));
    renderWithTheme(<SignUpForm />);
    await submitValidForm(user);

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(mockRegister).toHaveBeenCalledTimes(1);
  });

  it('moves on to the CV upload step once the registration is accepted', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({ status: 'ok', userId: 'user-1' });
    renderWithTheme(<SignUpForm />);

    await submitValidForm(user);

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith('/onboarding/cv-upload'));
  });

  it('shows a rejected email on its own field without clearing the form', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({
      status: 'error',
      fieldErrors: { email: 'This email is already registered' },
    });
    renderWithTheme(<SignUpForm />);

    await submitValidForm(user);

    expect(await screen.findByText('This email is already registered')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(
      'This email is already registered',
    );
    expect(screen.getByLabelText('First name')).toHaveValue('Ada');
  });

  it('puts the caret in the rejected field once the request settles', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({
      status: 'error',
      fieldErrors: { email: 'This email is already registered' },
    });
    renderWithTheme(<SignUpForm />);

    await submitValidForm(user);

    await waitFor(() => expect(screen.getByLabelText('Email')).toHaveFocus());
  });

  it('reports a failed request as a banner and lets the user try again', async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValue(new Error('Failed to fetch'));
    renderWithTheme(<SignUpForm />);

    await submitValidForm(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled(),
    );
  });

  it('restores a stored draft into every field but the passwords', async () => {
    storeDraft({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: { country: 'PL', number: '512345678' },
      termsAccepted: true,
    });

    renderWithTheme(<SignUpForm />);

    expect(await screen.findByDisplayValue('Ada')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name')).toHaveValue('Lovelace');
    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com');
    expect(screen.getByLabelText('Phone number')).toHaveValue('512345678');
    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveValue('PL');
    expect(screen.getByRole('checkbox', { name: TERMS_LABEL })).toBeChecked();
    expect(screen.getByLabelText('Set password')).toHaveValue('');
    expect(screen.getByLabelText('Confirm password')).toHaveValue('');
  });
});
