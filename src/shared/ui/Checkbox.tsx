'use client';

import {
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  useId,
} from 'react';
import styled from 'styled-components';

import { useOptionalFormField } from '@/shared/form';
import { composeHandlers, composeRefs } from '@/shared/lib';
import { textStyle } from '@/styles/text-style';
import { visuallyHidden } from '@/styles/visually-hidden';

import { ErrorMessage } from './FormError';
import { CheckIcon } from './icons';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  /** A message to show. `null` suppresses the form's: the caller renders its own feedback. */
  error?: string | null;
  ref?: Ref<HTMLInputElement>;
}

const Row = styled.label`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  cursor: pointer;
`;

const Control = styled.input`
  ${visuallyHidden};
`;

const Box = styled.span<{ $invalid: boolean }>`
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1px solid
    ${({ theme, $invalid }) => ($invalid ? theme.colors.border.error : theme.colors.border.default)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.background.default};
  transition:
    border-color ${({ theme }) => theme.transitions.fast},
    background-color ${({ theme }) => theme.transitions.fast};

  svg {
    opacity: 0;
  }

  input:checked + & {
    border-color: ${({ theme }) => theme.colors.brand};
    background: ${({ theme }) => theme.colors.brand};
    color: ${({ theme }) => theme.colors.text.inverse};
  }

  input:checked + & svg {
    opacity: 1;
  }

  @media (hover: hover) {
    ${Row}:hover input:not(:disabled) + & {
      border-color: ${({ theme, $invalid }) =>
        $invalid ? theme.colors.border.error : theme.colors.border.hover};
    }

    ${Row}:hover input:checked:not(:disabled) + & {
      background: ${({ theme }) => theme.colors.button.primaryHover};
      border-color: ${({ theme }) => theme.colors.button.primaryHover};
    }
  }

  input:focus-visible + & {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }

  input:disabled + & {
    opacity: ${({ theme }) => theme.opacity.disabled};
  }
`;

const Text = styled.span`
  ${textStyle('helper')};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Message = styled(ErrorMessage)`
  margin-top: 6px;
`;

export function Checkbox({
  label,
  error,
  name,
  id,
  ref,
  className,
  style,
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  ...inputProps
}: CheckboxProps) {
  const field = useOptionalFormField(name);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const errorMessage = error === null ? undefined : (error ?? field.error);
  const invalid = Boolean(errorMessage);
  const description = [describedBy, invalid ? messageId : undefined].filter(Boolean).join(' ');

  return (
    <div className={className} style={style}>
      <Row htmlFor={inputId}>
        <Control
          {...field.fieldProps}
          {...inputProps}
          type="checkbox"
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
          aria-invalid={invalid ? true : ariaInvalid}
          aria-describedby={description || undefined}
        />
        <Box aria-hidden="true" $invalid={invalid}>
          <CheckIcon size={12} />
        </Box>
        <Text>{label}</Text>
      </Row>
      {invalid ? <Message id={messageId}>{errorMessage}</Message> : null}
    </div>
  );
}
