'use client';

import {
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  useId,
} from 'react';
import styled, { css } from 'styled-components';

import { useOptionalFormField } from '@/shared/form';
import { composeHandlers, composeRefs } from '@/shared/lib';
import { textStyle } from '@/styles/text-style';

import { ErrorMessage } from './FormError';

export interface CustomFormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  /** A message to show. `null` suppresses the form's: the caller renders its own feedback. */
  error?: string | null;
  invalid?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  ${textStyle('bodyS')};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Row = styled.div`
  display: flex;
`;

const InputBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
`;

const Control = styled.input<{ $invalid: boolean; $leading: boolean; $trailing: boolean }>`
  ${textStyle('bodyM')};
  width: 100%;
  height: 40px;
  padding: ${({ theme }) => theme.spacing[2.5]} 14px;
  border: 1px solid
    ${({ theme, $invalid }) => ($invalid ? theme.colors.border.error : theme.colors.border.default)};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.background.default};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: border-color ${({ theme }) => theme.transitions.fast};

  @media (hover: hover) {
    &:hover:not(:disabled):not(:focus) {
      border-color: ${({ theme, $invalid }) =>
        $invalid ? theme.colors.border.error : theme.colors.border.hover};
    }
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.border.focus};
    outline: none;
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
  }

  ${({ $leading }) =>
    $leading &&
    css`
      margin-left: -1px;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;

      &:focus {
        position: relative;
        z-index: 1;
      }
    `};

  ${({ $trailing }) =>
    $trailing &&
    css`
      padding-right: 44px;
    `};
`;

const Trailing = styled.span`
  position: absolute;
  top: 50%;
  right: 8px;
  display: inline-flex;
  align-items: center;
  transform: translateY(-50%);
`;

const Hint = styled.p`
  ${textStyle('bodyS')};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export function CustomFormInput({
  label,
  hint,
  error,
  invalid: invalidProp = false,
  leading,
  trailing,
  name,
  id,
  ref,
  className,
  style,
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  ...inputProps
}: CustomFormInputProps) {
  const field = useOptionalFormField(name);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const errorMessage = error === null ? undefined : (error ?? field.error);
  const hasError = Boolean(errorMessage);
  const invalid = invalidProp || hasError;
  const message = errorMessage || hint;
  const description = [describedBy, message ? messageId : undefined].filter(Boolean).join(' ');

  return (
    <Field className={className} style={style}>
      <Label htmlFor={inputId}>{label}</Label>
      <Row>
        {leading}
        <InputBox>
          <Control
            {...field.fieldProps}
            {...inputProps}
            name={name}
            id={inputId}
            ref={composeRefs(field.fieldProps?.ref, ref)}
            onChange={composeHandlers<ChangeEvent<HTMLInputElement>>(
              field.fieldProps?.onChange,
              inputProps.onChange,
            )}
            onBlur={composeHandlers<FocusEvent<HTMLInputElement>>(
              field.fieldProps?.onBlur,
              inputProps.onBlur,
            )}
            $invalid={invalid}
            $leading={Boolean(leading)}
            $trailing={Boolean(trailing)}
            aria-invalid={invalid ? true : ariaInvalid}
            aria-describedby={description || undefined}
          />
          {trailing ? <Trailing>{trailing}</Trailing> : null}
        </InputBox>
      </Row>
      {hasError ? <ErrorMessage id={messageId}>{errorMessage}</ErrorMessage> : null}
      {!hasError && hint ? <Hint id={messageId}>{hint}</Hint> : null}
    </Field>
  );
}
