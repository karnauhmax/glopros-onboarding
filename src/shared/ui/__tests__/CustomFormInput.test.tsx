import { zodResolver } from '@hookform/resolvers/zod';
import userEvent from '@testing-library/user-event';
import type { ChangeEventHandler } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { CustomForm } from '@/shared/form';
import { renderWithTheme, screen, waitFor } from '@/test-utils';

import { CustomFormInput } from '../CustomFormInput';
import { Select } from '../Select';

const schema = z.object({ email: z.string().min(1, 'Enter your email') });

function noop() {}

function BoundForm({
  onSubmit = noop,
  onChange,
}: {
  onSubmit?: () => unknown;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  return (
    <CustomForm form={form} onSubmit={onSubmit}>
      <CustomFormInput name="email" label="Email" onChange={onChange} />
      <button type="submit">Submit</button>
    </CustomForm>
  );
}

describe('CustomFormInput', () => {
  it('exposes the hint as the accessible description of the input', () => {
    renderWithTheme(<CustomFormInput label="Email" hint="We never share it" />);

    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('We never share it');
  });

  it('describes the input with the error instead of the hint', () => {
    renderWithTheme(
      <CustomFormInput label="Email" hint="We never share it" error="Enter a valid email" />,
    );

    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Enter a valid email');
    expect(screen.queryByText('We never share it')).not.toBeInTheDocument();
  });

  it('keeps a description given by the caller alongside the hint', () => {
    renderWithTheme(
      <>
        <CustomFormInput label="Email" hint="We never share it" aria-describedby="phone-note" />
        <p id="phone-note">Used for the phone check</p>
      </>,
    );

    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(
      'Used for the phone check We never share it',
    );
  });

  it('marks the input as invalid while an error is present', () => {
    renderWithTheme(<CustomFormInput label="Email" error="Enter a valid email" />);

    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('leaves the input valid when no error is given', () => {
    renderWithTheme(<CustomFormInput label="Email" hint="We never share it" />);

    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
  });

  it('respects an invalid flag set by the caller without an error text', () => {
    renderWithTheme(<CustomFormInput label="Email" aria-invalid />);

    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('marks the input invalid on the invalid prop while keeping the hint visible', () => {
    renderWithTheme(<CustomFormInput label="Set password" hint="9+ characters" invalid />);

    expect(screen.getByLabelText('Set password')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('9+ characters')).toBeInTheDocument();
  });

  it('shows no message when the error is an empty string', () => {
    renderWithTheme(<CustomFormInput label="Set password" error="" invalid />);

    expect(screen.getByLabelText('Set password')).not.toHaveAccessibleDescription();
  });

  it('renders trailing content inside the field', () => {
    renderWithTheme(
      <CustomFormInput
        label="Set password"
        trailing={<button type="button">Show password</button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
  });

  it('renders leading content before the input', () => {
    renderWithTheme(
      <CustomFormInput
        label="Phone number"
        leading={
          <Select
            label="Country"
            options={[{ value: 'NL', label: 'Netherlands' }]}
            value="NL"
            onChange={jest.fn()}
          />
        }
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Country' })).toBeInTheDocument();
  });

  it('feeds what the user types into the form value of the field it is named after', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    renderWithTheme(<BoundForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'ada@glopros.com');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ email: 'ada@glopros.com' }, expect.anything()),
    );
  });

  it('keeps the form binding when the caller passes its own onChange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onSubmit = jest.fn();
    renderWithTheme(<BoundForm onSubmit={onSubmit} onChange={onChange} />);

    await user.type(screen.getByLabelText('Email'), 'ada@glopros.com');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onChange).toHaveBeenCalled();
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ email: 'ada@glopros.com' }, expect.anything()),
    );
  });

  it('describes the input with the error the form holds for its field', async () => {
    const user = userEvent.setup();
    renderWithTheme(<BoundForm />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await expect(screen.findByLabelText('Email')).resolves.toHaveAccessibleDescription(
      'Enter your email',
    );
  });
});
