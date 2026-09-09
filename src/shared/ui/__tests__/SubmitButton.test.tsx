import { zodResolver } from '@hookform/resolvers/zod';
import userEvent from '@testing-library/user-event';
import { useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { CustomForm } from '@/shared/form';
import { act, createDeferred, renderWithTheme, screen } from '@/test-utils';

import { CustomFormInput } from '../CustomFormInput';
import { SubmitButton } from '../SubmitButton';

const schema = z.object({ email: z.string().min(1, 'Enter your email') });

function noop() {}

function ServerErrorButton() {
  const form = useFormContext<{ email: string }>();

  return (
    <button
      type="button"
      onClick={() => form.setError('email', { type: 'server', message: 'Taken' })}
    >
      Fail on the server
    </button>
  );
}

function TestForm({ onSubmit = noop }: { onSubmit?: () => unknown }) {
  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  return (
    <CustomForm form={form} onSubmit={onSubmit}>
      <CustomFormInput name="email" label="Email" />
      <ServerErrorButton />
      <SubmitButton>Create account</SubmitButton>
    </CustomForm>
  );
}

describe('SubmitButton', () => {
  let submitting = createDeferred();

  beforeEach(() => {
    submitting = createDeferred();
  });

  afterEach(async () => {
    await act(async () => {
      submitting.resolve();
    });
  });

  it('submits without a gate outside a form', () => {
    renderWithTheme(<SubmitButton>Create account</SubmitButton>);

    const button = screen.getByRole('button', { name: 'Create account' });

    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('stays disabled while the form is invalid', async () => {
    renderWithTheme(<TestForm />);

    expect(await screen.findByRole('button', { name: 'Create account' })).toBeDisabled();
  });

  it('becomes enabled once the form is valid', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestForm />);

    await user.type(screen.getByLabelText('Email'), 'ada@glopros.com');

    await expect(screen.findByRole('button', { name: 'Create account' })).resolves.toBeEnabled();
  });

  it('goes back to disabled when the server reports an error on a valid form', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestForm />);
    await user.type(screen.getByLabelText('Email'), 'ada@glopros.com');
    await user.tab();
    await expect(screen.findByRole('button', { name: 'Create account' })).resolves.toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Fail on the server' }));

    expect(screen.getByRole('button', { name: 'Create account' })).toBeDisabled();
  });

  it('reports itself busy while the form is submitting', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestForm onSubmit={() => submitting.promise} />);
    await user.type(screen.getByLabelText('Email'), 'ada@glopros.com');

    await user.click(await screen.findByRole('button', { name: 'Create account' }));

    expect(screen.getByRole('button', { name: 'Create account' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });
});
