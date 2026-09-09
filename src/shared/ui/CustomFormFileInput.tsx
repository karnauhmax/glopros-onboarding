'use client';

import {
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  useId,
  useRef,
  useState,
} from 'react';
import styled, { css } from 'styled-components';

import { useOptionalFormField } from '@/shared/form';
import { composeRefs } from '@/shared/lib';
import { visuallyHidden } from '@/styles/visually-hidden';

import { ErrorMessage } from './FormError';

export interface CustomFormFileInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'onChange' | 'onSelect' | 'type' | 'value'
> {
  label: string;
  onSelectFile(file: File): void;
  error?: string | null;
  invalid?: boolean;
  children: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

const Box = styled.div<{ $dragging: boolean; $invalid: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[10]} ${({ theme }) => theme.spacing[6]};
  border: 1px solid
    ${({ theme, $invalid }) => ($invalid ? theme.colors.border.error : theme.colors.border.default)};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.background.default};
  cursor: pointer;
  transition:
    border-color ${({ theme }) => theme.transitions.fast},
    background-color ${({ theme }) => theme.transitions.fast};

  @media (hover: hover) {
    &:hover:not(:focus-within):not(:has(input:disabled)) {
      border-color: ${({ theme, $invalid }) =>
        $invalid ? theme.colors.border.error : theme.colors.border.hover};
    }
  }

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }

  &:has(input:disabled) {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: default;
  }

  ${({ $dragging }) =>
    $dragging &&
    css`
      border-color: ${({ theme }) => theme.colors.border.focus};
      background: ${({ theme }) => theme.colors.background.secondary};
    `};
`;

const HiddenLabel = styled.label`
  ${visuallyHidden};
`;

const Control = styled.input`
  ${visuallyHidden};
`;

export function CustomFormFileInput({
  label,
  onSelectFile,
  error,
  invalid: invalidProp = false,
  children,
  name,
  disabled,
  id,
  ref,
  className,
  style,
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  ...inputProps
}: CustomFormFileInputProps) {
  const field = useOptionalFormField(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragDepth, setDragDepth] = useState(0);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const errorMessage = error === null ? undefined : (error ?? field.error);
  const hasError = Boolean(errorMessage);
  const invalid = invalidProp || hasError;
  const dragging = dragDepth > 0 && !disabled;
  const description = [describedBy, hasError ? messageId : undefined].filter(Boolean).join(' ');

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleFile = (file: File) => {
    field.setValue?.(file);
    onSelectFile(file);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];

    event.target.value = '';

    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragDepth(0);

    const [file] = event.dataTransfer.files;

    if (file && !disabled) {
      handleFile(file);
    }
  };

  return (
    <Box
      className={className}
      style={style}
      $dragging={dragging}
      $invalid={invalid}
      onClick={handleClick}
      onDragEnter={() => setDragDepth((depth) => depth + 1)}
      onDragLeave={() => setDragDepth((depth) => depth - 1)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <HiddenLabel htmlFor={inputId}>{label}</HiddenLabel>
      <Control
        {...inputProps}
        type="file"
        name={name}
        id={inputId}
        ref={composeRefs(ref, inputRef)}
        disabled={disabled}
        onChange={handleChange}
        onClick={(event) => event.stopPropagation()}
        aria-invalid={invalid ? true : ariaInvalid}
        aria-describedby={description || undefined}
      />
      {children}
      {hasError ? <ErrorMessage id={messageId}>{errorMessage}</ErrorMessage> : null}
    </Box>
  );
}
