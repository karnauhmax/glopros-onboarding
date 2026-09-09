import { zodResolver } from '@hookform/resolvers/zod';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { useOptionalFormContext, useOptionalFormField } from '../form-context';

function FormWrapper({ children }: { children: ReactNode }) {
  const form = useForm({ defaultValues: { x: '' } });

  return <FormProvider {...form}>{children}</FormProvider>;
}

function ValidatedFormWrapper({ children }: { children: ReactNode }) {
  const form = useForm({
    resolver: zodResolver(z.object({ x: z.string().min(1, 'Required') })),
    defaultValues: { x: '' },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}

function useBoundField(name?: string) {
  return { form: useFormContext(), binding: useOptionalFormField(name) };
}

describe('useOptionalFormContext', () => {
  it('returns null outside a form provider', () => {
    const { result } = renderHook(() => useOptionalFormContext());

    expect(result.current).toBeNull();
  });
});

describe('useOptionalFormField', () => {
  it('returns an empty binding outside a form provider', () => {
    const { result } = renderHook(() => useOptionalFormField('x'));

    expect(result.current).toEqual({});
  });

  it('returns an empty binding when no field name is given', () => {
    const { result } = renderHook(() => useOptionalFormField(), { wrapper: FormWrapper });

    expect(result.current).toEqual({});
  });

  it('reports no error while the form holds none for the field', () => {
    const { result } = renderHook(() => useBoundField('x'), { wrapper: FormWrapper });

    expect(result.current.binding.error).toBeUndefined();
  });

  it('reports the error message the form holds for the field', () => {
    const { result } = renderHook(() => useBoundField('x'), { wrapper: FormWrapper });

    act(() => {
      result.current.form.setError('x', { message: 'Bad' });
    });

    expect(result.current.binding.error).toBe('Bad');
  });

  it('writes a value the control owns into the form', () => {
    const { result } = renderHook(() => useBoundField('x'), { wrapper: FormWrapper });

    act(() => {
      result.current.binding.setValue?.('written');
    });

    expect(result.current.form.getValues('x')).toBe('written');
  });

  it('revalidates the field it writes, so a raised error clears itself', async () => {
    const { result } = renderHook(() => useBoundField('x'), { wrapper: ValidatedFormWrapper });
    await act(async () => {
      await result.current.form.trigger('x');
    });
    expect(result.current.binding.error).toBe('Required');

    act(() => {
      result.current.binding.setValue?.('written');
    });

    await waitFor(() => expect(result.current.binding.error).toBeUndefined());
  });
});
