'use client';

import { useFormState } from 'react-hook-form';

import { useOptionalFormContext } from '@/shared/form';

import { Button, type ButtonProps } from './Button';

export interface SubmitButtonProps extends Omit<ButtonProps, 'type'> {}

function ConnectedSubmitButton({ disabled, loading, ...rest }: SubmitButtonProps) {
  const { errors, isSubmitting, isValid } = useFormState();

  return (
    <Button
      {...rest}
      type="submit"
      disabled={disabled || !isValid || Object.keys(errors).length > 0 || isSubmitting}
      loading={loading ?? isSubmitting}
    />
  );
}

export function SubmitButton(props: SubmitButtonProps) {
  const form = useOptionalFormContext();

  return form ? <ConnectedSubmitButton {...props} /> : <Button {...props} type="submit" />;
}
