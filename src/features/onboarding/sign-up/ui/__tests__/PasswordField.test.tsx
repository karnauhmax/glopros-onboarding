import { zodResolver } from '@hookform/resolvers/zod';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

import { CustomForm } from '@/shared/form';
import { renderWithTheme, screen, waitFor } from '@/test-utils';

import { emptySignUpValues, signUpSchema } from '../../validation';
import { PasswordField } from '../PasswordField';

function noop() {}

function TestForm() {
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
    defaultValues: emptySignUpValues,
  });

  return (
    <CustomForm form={form} onSubmit={noop}>
      <PasswordField name="password" label="Set password" withChecklist />
      <PasswordField name="confirmPassword" label="Confirm password" />
    </CustomForm>
  );
}

describe('PasswordField', () => {
  it('keeps the password hidden until the user asks for it', () => {
    renderWithTheme(<TestForm />);

    expect(screen.getByLabelText('Set password')).toHaveAttribute('type', 'password');
  });

  it('reveals the password of its own field only', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestForm />);

    const [firstToggle] = screen.getAllByRole('button', { name: 'Show password' });
    await user.click(firstToggle);

    expect(screen.getByLabelText('Set password')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Confirm password')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
  });

  it('marks an invalid password without repeating the rules as a message', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestForm />);

    await user.type(screen.getByLabelText('Set password'), 'short');
    await user.tab();

    await waitFor(() =>
      expect(screen.getByLabelText('Set password')).toHaveAttribute('aria-invalid', 'true'),
    );
    expect(screen.getByLabelText('Set password')).toHaveAccessibleDescription(/9\+ characters/);
  });

  it('spells out a password mismatch, which no checklist covers', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestForm />);

    await user.type(screen.getByLabelText('Set password'), 'Password1');
    await user.type(screen.getByLabelText('Confirm password'), 'Password2');
    await user.tab();

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });

  it('shows the requirement checklist only for the field that asks for it', () => {
    renderWithTheme(<TestForm />);

    expect(screen.getByRole('list', { name: 'Password requirements' })).toBeInTheDocument();
    expect(screen.getAllByRole('list')).toHaveLength(1);
  });
});
