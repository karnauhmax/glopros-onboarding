import { zodResolver } from '@hookform/resolvers/zod';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';

import { CustomForm } from '@/shared/form';
import { renderWithTheme, screen, waitFor } from '@/test-utils';

import { emptySignUpValues, signUpSchema } from '../../validation';
import { PhoneField } from '../PhoneField';

function noop() {}

function TestForm({ children }: { children: ReactNode }) {
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
    defaultValues: emptySignUpValues,
  });

  return (
    <CustomForm form={form} onSubmit={noop}>
      {children}
    </CustomForm>
  );
}

function renderPhoneField() {
  renderWithTheme(
    <TestForm>
      <PhoneField />
    </TestForm>,
  );
}

describe('PhoneField', () => {
  it('offers the three supported countries with the Netherlands selected', () => {
    renderPhoneField();

    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveValue('NL');
    expect(screen.getByRole('option', { name: 'Netherlands' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Poland' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Ukraine' })).toBeInTheDocument();
  });

  it('shows the example number and the format of the selected country', () => {
    renderPhoneField();

    const input = screen.getByLabelText('Phone number');

    expect(input).toHaveAttribute('placeholder', '6 12345678');
    expect(input).toHaveAccessibleDescription('+31 · 9 digits');
  });

  it('switches the example number and the format when another country is picked', async () => {
    const user = userEvent.setup();
    renderPhoneField();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Country' }), 'PL');

    const input = screen.getByLabelText('Phone number');

    expect(input).toHaveAttribute('placeholder', '512 345 678');
    expect(input).toHaveAccessibleDescription('+48 · 9 digits');
  });

  it('reports one error for the country and the number once the number is left', async () => {
    const user = userEvent.setup();
    renderPhoneField();

    await user.type(screen.getByLabelText('Phone number'), '12345');
    await user.tab();

    await waitFor(() =>
      expect(screen.getByLabelText('Phone number')).toHaveAccessibleDescription(
        'Enter a valid phone number for Netherlands',
      ),
    );
    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('shows the format again once the number becomes valid', async () => {
    const user = userEvent.setup();
    renderPhoneField();
    await user.type(screen.getByLabelText('Phone number'), '12345');
    await user.tab();
    await waitFor(() =>
      expect(screen.getByLabelText('Phone number')).toHaveAccessibleDescription(
        'Enter a valid phone number for Netherlands',
      ),
    );

    await user.clear(screen.getByLabelText('Phone number'));
    await user.type(screen.getByLabelText('Phone number'), '612345678');

    await waitFor(() =>
      expect(screen.getByLabelText('Phone number')).toHaveAccessibleDescription('+31 · 9 digits'),
    );
    expect(screen.getByRole('combobox', { name: 'Country' })).not.toHaveAttribute('aria-invalid');
  });
});
