'use client';

import {
  type FieldError,
  get,
  useFormContext,
  type UseFormRegisterReturn,
  type UseFormReturn,
} from 'react-hook-form';

export interface FormFieldBinding {
  fieldProps?: UseFormRegisterReturn;
  error?: string;
  setValue?(value: unknown): void;
}

export function useOptionalFormContext(): UseFormReturn | null {
  return useFormContext() as UseFormReturn | null;
}

export function useOptionalFormField(name?: string): FormFieldBinding {
  const form = useOptionalFormContext();

  if (!form || !name) {
    return {};
  }

  const error: FieldError | undefined = get(form.formState.errors, name);

  return {
    fieldProps: form.register(name),
    error: error?.message,
    setValue: (value) => form.setValue(name, value, { shouldValidate: true }),
  };
}
