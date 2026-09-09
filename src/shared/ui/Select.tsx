'use client';

import { type ReactNode, type Ref, type SelectHTMLAttributes, useId } from 'react';
import styled from 'styled-components';

import { textStyle } from '@/styles/text-style';
import { visuallyHidden } from '@/styles/visually-hidden';

import { ChevronDownIcon } from './icons';

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'children' | 'multiple' | 'defaultValue' | 'value'
> {
  options: SelectOption[];
  label: string;
  value: string;
  invalid?: boolean;
  ref?: Ref<HTMLSelectElement>;
}

const Root = styled.div<{ $invalid: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  height: 40px;
  padding: 0 ${({ theme }) => theme.spacing[3]} 0 14px;
  border: 1px solid
    ${({ theme, $invalid }) => ($invalid ? theme.colors.border.error : theme.colors.border.default)};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.background.default};
  transition: border-color ${({ theme }) => theme.transitions.fast};

  @media (hover: hover) {
    &:hover:not(:focus-within):not(:has(select:disabled)) {
      border-color: ${({ theme, $invalid }) =>
        $invalid ? theme.colors.border.error : theme.colors.border.hover};
    }
  }

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.border.focus};
  }

  &:has(select:disabled) {
    opacity: ${({ theme }) => theme.opacity.disabled};
  }
`;

const HiddenLabel = styled.label`
  ${visuallyHidden};
`;

const Trigger = styled.span`
  ${textStyle('bodyM')};
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Chevron = styled.span`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Control = styled.select`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  appearance: none;
  opacity: 0;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
`;

export function Select({
  options,
  label,
  value,
  invalid = false,
  id,
  ref,
  className,
  style,
  onChange,
  ...selectProps
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const selected = options.find((option) => option.value === value);

  return (
    <Root $invalid={invalid} className={className} style={style}>
      <HiddenLabel htmlFor={selectId}>{label}</HiddenLabel>
      <Trigger aria-hidden="true">{selected?.icon ?? selected?.label}</Trigger>
      <Chevron>
        <ChevronDownIcon size={20} />
      </Chevron>
      <Control
        {...selectProps}
        id={selectId}
        ref={ref}
        value={value}
        onChange={onChange}
        aria-invalid={invalid || undefined}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Control>
    </Root>
  );
}
