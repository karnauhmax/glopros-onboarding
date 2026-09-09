'use client';

import { useId, useState } from 'react';
import { useFormState } from 'react-hook-form';
import styled from 'styled-components';

import { CustomFormInput, EyeIcon, EyeOffIcon } from '@/shared/ui';

import type { SignUpFormValues } from '../validation';
import { PasswordChecklist } from './PasswordChecklist';

export interface PasswordFieldProps {
  name: 'confirmPassword' | 'password';
  label: string;
  withChecklist?: boolean;
}

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const EyeToggle = styled.button`
  display: inline-flex;
  margin: 0;
  padding: ${({ theme }) => theme.spacing[1]};
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

export function PasswordField({ name, label, withChecklist = false }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const checklistId = useId();
  const { errors } = useFormState<SignUpFormValues>({ name });
  const error = errors[name];

  return (
    <Field>
      <CustomFormInput
        name={name}
        label={label}
        type={visible ? 'text' : 'password'}
        autoComplete="new-password"
        invalid={Boolean(error)}
        aria-describedby={withChecklist ? checklistId : undefined}
        error={withChecklist && error?.type !== 'server' ? null : error?.message}
        trailing={
          <EyeToggle
            type="button"
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </EyeToggle>
        }
      />
      {withChecklist ? <PasswordChecklist id={checklistId} /> : null}
    </Field>
  );
}
