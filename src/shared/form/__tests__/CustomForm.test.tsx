import { zodResolver } from '@hookform/resolvers/zod';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { act, createDeferred, renderWithTheme, screen, waitFor } from '@/test-utils';

import { CustomForm } from '../CustomForm';

const schema = z.object({ name: z.string().trim() });

function TestForm({ onSubmit }: { onSubmit: (values: { name: string }) => unknown }) {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: '' } });

  return (
    <CustomForm form={form} onSubmit={onSubmit}>
      <label htmlFor="name">Name</label>
      <input id="name" {...form.register('name')} />
      <button type="submit">Submit</button>
    </CustomForm>
  );
}

describe('CustomForm', () => {
  let submitting = createDeferred();

  beforeEach(() => {
    submitting = createDeferred();
  });

  afterEach(async () => {
    await act(async () => {
      submitting.resolve();
    });
  });

  it('calls the submit handler with the values the schema produced', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    renderWithTheme(<TestForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Name'), '  Ada  ');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'Ada' }, expect.anything()));
  });

  it('disables its fields while the submit handler is pending', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestForm onSubmit={() => submitting.promise} />);

    await user.type(screen.getByLabelText('Name'), 'Ada');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(screen.getByLabelText('Name')).toBeDisabled());
  });

  it('enables its fields again once the submit handler settles', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestForm onSubmit={() => submitting.promise} />);
    await user.type(screen.getByLabelText('Name'), 'Ada');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByLabelText('Name')).toBeDisabled());

    await act(async () => {
      submitting.resolve();
    });

    expect(screen.getByLabelText('Name')).toBeEnabled();
  });
});
