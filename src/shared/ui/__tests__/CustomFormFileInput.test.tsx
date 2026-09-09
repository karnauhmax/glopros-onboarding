import { zodResolver } from '@hookform/resolvers/zod';
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { CustomForm } from '@/shared/form';
import { renderWithTheme, screen, waitFor } from '@/test-utils';

import { Button } from '../Button';
import { CustomFormFileInput, type CustomFormFileInputProps } from '../CustomFormFileInput';

const cv = new File(['ada'], 'ada-lovelace.pdf', { type: 'application/pdf' });

const dataTransfer = { files: [cv], items: [], types: ['Files'] };

const cvSchema = z.object({ cv: z.instanceof(File, { message: 'Add your CV' }) });

function renderFileInput(props: Partial<CustomFormFileInputProps> = {}) {
  return renderWithTheme(
    <CustomFormFileInput label="Upload CV" onSelectFile={jest.fn()} {...props}>
      <span>Drag &amp; drop CV</span>
    </CustomFormFileInput>,
  );
}

function CvForm({ onSubmit }: { onSubmit(values: { cv: File }): void }) {
  const form = useForm({ resolver: zodResolver(cvSchema), defaultValues: { cv: undefined } });

  return (
    <CustomForm form={form} onSubmit={onSubmit}>
      <CustomFormFileInput label="Upload CV" name="cv" onSelectFile={jest.fn()}>
        <span>Drag &amp; drop CV</span>
      </CustomFormFileInput>
      <Button type="submit">Submit</Button>
    </CustomForm>
  );
}

describe('CustomFormFileInput', () => {
  it('hands the picked file to the caller', async () => {
    const user = userEvent.setup();
    const onSelectFile = jest.fn();
    renderFileInput({ onSelectFile });

    await user.upload(screen.getByLabelText('Upload CV'), cv);

    expect(onSelectFile).toHaveBeenCalledTimes(1);
    expect(onSelectFile).toHaveBeenCalledWith(cv);
  });

  it('opens the file dialog once when the box content is clicked', async () => {
    const user = userEvent.setup();
    renderFileInput();
    const openDialog = jest.spyOn(screen.getByLabelText('Upload CV'), 'click');

    await user.click(screen.getByText('Drag & drop CV'));

    expect(openDialog).toHaveBeenCalledTimes(1);
  });

  it('leaves the file dialog shut when the box content is clicked while disabled', async () => {
    const user = userEvent.setup();
    renderFileInput({ disabled: true });
    const openDialog = jest.spyOn(screen.getByLabelText('Upload CV'), 'click');

    await user.click(screen.getByText('Drag & drop CV'));

    expect(openDialog).not.toHaveBeenCalled();
  });

  it('hands a dropped file to the caller', () => {
    const onSelectFile = jest.fn();
    renderFileInput({ onSelectFile });

    fireEvent.drop(screen.getByText('Drag & drop CV'), { dataTransfer });

    expect(onSelectFile).toHaveBeenCalledWith(cv);
  });

  it('takes the first file when several are dropped at once', () => {
    const other = new File(['grace'], 'grace-hopper.pdf', { type: 'application/pdf' });
    const onSelectFile = jest.fn();
    renderFileInput({ onSelectFile });

    fireEvent.drop(screen.getByText('Drag & drop CV'), {
      dataTransfer: { files: [cv, other], items: [], types: ['Files'] },
    });

    expect(onSelectFile).toHaveBeenCalledTimes(1);
    expect(onSelectFile).toHaveBeenCalledWith(cv);
  });

  it('reports the same file again when the user picks it twice', async () => {
    const user = userEvent.setup();
    const onSelectFile = jest.fn();
    renderFileInput({ onSelectFile });

    await user.upload(screen.getByLabelText('Upload CV'), cv);
    await user.upload(screen.getByLabelText('Upload CV'), cv);

    expect(onSelectFile).toHaveBeenCalledTimes(2);
  });

  it('ignores a pick while disabled', async () => {
    const user = userEvent.setup();
    const onSelectFile = jest.fn();
    renderFileInput({ onSelectFile, disabled: true });

    await user.upload(screen.getByLabelText('Upload CV'), cv);

    expect(onSelectFile).not.toHaveBeenCalled();
  });

  it('ignores a drop while disabled', () => {
    const onSelectFile = jest.fn();
    renderFileInput({ onSelectFile, disabled: true });

    fireEvent.drop(screen.getByText('Drag & drop CV'), { dataTransfer });

    expect(onSelectFile).not.toHaveBeenCalled();
  });

  it('describes the input with the error and marks it invalid', () => {
    renderFileInput({ error: 'Use a PDF, DOC or DOCX file.' });

    expect(screen.getByText('Use a PDF, DOC or DOCX file.')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload CV')).toHaveAttribute('aria-invalid', 'true');
  });

  it('keeps the input invalid without a message when the error is suppressed', () => {
    renderFileInput({ error: null, invalid: true });

    expect(screen.getByLabelText('Upload CV')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Upload CV')).not.toHaveAccessibleDescription();
  });

  it('leaves the input valid when no error is given', () => {
    renderFileInput();

    expect(screen.getByLabelText('Upload CV')).not.toHaveAttribute('aria-invalid');
  });

  it('gives the picked file to the form it is named in', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    renderWithTheme(<CvForm onSubmit={onSubmit} />);

    await user.upload(screen.getByLabelText('Upload CV'), cv);
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ cv });
  });

  it('shows the error the form holds for the field it is named after', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CvForm onSubmit={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Add your CV')).toBeInTheDocument();
  });

  it('clears the form error as soon as a file answers it', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CvForm onSubmit={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByText('Add your CV');

    await user.upload(screen.getByLabelText('Upload CV'), cv);

    await waitFor(() => expect(screen.queryByText('Add your CV')).not.toBeInTheDocument());
  });
});
