import { zodResolver } from '@hookform/resolvers/zod';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

import { CustomForm } from '@/shared/form';
import { CustomFormInput } from '@/shared/ui';
import { renderWithTheme, screen, within } from '@/test-utils';

import { emptySignUpValues, signUpSchema } from '../../validation';
import { PasswordChecklist } from '../PasswordChecklist';

function noop() {}

function TestForm() {
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
    defaultValues: emptySignUpValues,
  });

  return (
    <CustomForm form={form} onSubmit={noop}>
      <CustomFormInput name="password" label="Set password" />
      <PasswordChecklist />
    </CustomForm>
  );
}

describe('PasswordChecklist', () => {
  it('lists the three password requirements in the order of the design', () => {
    renderWithTheme(<TestForm />);

    const items = within(screen.getByRole('list', { name: 'Password requirements' })).getAllByRole(
      'listitem',
    );

    expect(items[0]).toHaveTextContent('9+ characters');
    expect(items[1]).toHaveTextContent('Number');
    expect(items[2]).toHaveTextContent('Letters (uppercase & lowercase)');
  });

  it('reports every requirement as not met while nothing is typed', () => {
    renderWithTheme(<TestForm />);

    const items = screen.getAllByRole('listitem');

    expect(within(items[0]).getByText('not met')).toBeInTheDocument();
    expect(within(items[1]).getByText('not met')).toBeInTheDocument();
    expect(within(items[2]).getByText('not met')).toBeInTheDocument();
  });

  it('marks every requirement as met while the user is still typing', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestForm />);

    await user.type(screen.getByLabelText('Set password'), 'Password1');

    const items = screen.getAllByRole('listitem');

    expect(within(items[0]).getByText('met')).toBeInTheDocument();
    expect(within(items[1]).getByText('met')).toBeInTheDocument();
    expect(within(items[2]).getByText('met')).toBeInTheDocument();
  });

  it('marks only the requirements a password fulfils', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestForm />);

    await user.type(screen.getByLabelText('Set password'), 'passphrase');

    const items = screen.getAllByRole('listitem');

    expect(within(items[0]).getByText('met')).toBeInTheDocument();
    expect(within(items[1]).getByText('not met')).toBeInTheDocument();
    expect(within(items[2]).getByText('not met')).toBeInTheDocument();
  });
});
