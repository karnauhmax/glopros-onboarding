import userEvent from '@testing-library/user-event';
import type { ChangeEventHandler } from 'react';
import { useForm } from 'react-hook-form';

import { CustomForm } from '@/shared/form';
import { renderWithTheme, screen, waitFor } from '@/test-utils';

import { Checkbox } from '../Checkbox';
import { Link } from '../Link';

function noop() {}

function TermsForm({
  onSubmit = noop,
  onChange,
}: {
  onSubmit?: () => unknown;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
  const form = useForm({ defaultValues: { termsAccepted: false } });

  return (
    <CustomForm form={form} onSubmit={onSubmit}>
      <Checkbox name="termsAccepted" label="I agree to the terms" onChange={onChange} />
      <button type="submit">Submit</button>
    </CustomForm>
  );
}

const termsLabel = (
  <>
    I agree to the{' '}
    <Link external href="#">
      terms
    </Link>
  </>
);

describe('Checkbox', () => {
  it('names the checkbox with its label including the text of a link inside it', () => {
    renderWithTheme(<Checkbox label={termsLabel} />);

    expect(screen.getByRole('checkbox', { name: /i agree to the terms/i })).toBeInTheDocument();
  });

  it('describes the checkbox with the error and marks it invalid', () => {
    renderWithTheme(<Checkbox label={termsLabel} error="You must accept the terms" />);

    const checkbox = screen.getByRole('checkbox', { name: /i agree to the terms/i });

    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAccessibleDescription('You must accept the terms');
  });

  it('keeps a description given by the caller alongside the error', () => {
    renderWithTheme(
      <>
        <Checkbox label={termsLabel} error="You must accept the terms" aria-describedby="why" />
        <p id="why">Required to create an account</p>
      </>,
    );

    expect(
      screen.getByRole('checkbox', { name: /i agree to the terms/i }),
    ).toHaveAccessibleDescription('Required to create an account You must accept the terms');
  });

  it('toggles the form value of the field it is named after', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    renderWithTheme(<TermsForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('checkbox', { name: 'I agree to the terms' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ termsAccepted: true }, expect.anything()),
    );
  });

  it('keeps the form binding when the caller passes its own onChange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onSubmit = jest.fn();
    renderWithTheme(<TermsForm onSubmit={onSubmit} onChange={onChange} />);

    await user.click(screen.getByRole('checkbox', { name: 'I agree to the terms' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ termsAccepted: true }, expect.anything()),
    );
  });
});
