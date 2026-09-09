'use client';

import type { FormHTMLAttributes } from 'react';
import {
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';
import styled from 'styled-components';

export interface CustomFormProps<TValues extends FieldValues, TOutput = TValues> extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'onSubmit'
> {
  form: UseFormReturn<TValues, unknown, TOutput>;
  onSubmit: SubmitHandler<TOutput>;
}

// Stryker disable next-line all: a CSS reset carries no behaviour
const Fieldset = styled.fieldset`
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
`;

export function CustomForm<TValues extends FieldValues, TOutput = TValues>({
  form,
  onSubmit,
  children,
  ...rest
}: CustomFormProps<TValues, TOutput>) {
  return (
    <FormProvider {...form}>
      <form {...rest} noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <Fieldset disabled={form.formState.isSubmitting}>{children}</Fieldset>
      </form>
    </FormProvider>
  );
}
