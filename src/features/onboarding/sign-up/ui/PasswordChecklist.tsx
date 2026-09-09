'use client';

import { useFormState, useWatch } from 'react-hook-form';
import styled from 'styled-components';

import { RequirementCheckIcon } from '@/shared/ui';
import { textStyle } from '@/styles/text-style';
import { visuallyHidden } from '@/styles/visually-hidden';

import { passwordRules, type SignUpFormValues } from '../validation';

export interface PasswordChecklistProps {
  id?: string;
}

type RuleState = 'met' | 'neutral' | 'unmet';

const List = styled.ul`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Item = styled.li<{ $state: RuleState }>`
  ${textStyle('caption')};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme, $state }) => {
    if ($state === 'met') {
      return theme.colors.icon.success;
    }

    return $state === 'unmet' ? theme.colors.text.error : theme.colors.text.secondary;
  }};
`;

const Status = styled.span`
  ${visuallyHidden};
`;

function ruleState(met: boolean, touched: boolean): RuleState {
  if (met) {
    return 'met';
  }

  return touched ? 'unmet' : 'neutral';
}

/**
 * Live feedback for the password field, in place of an error message. Every rule states its status
 * in text so a screen reader does not depend on colour.
 */
export function PasswordChecklist({ id }: PasswordChecklistProps) {
  const value = useWatch<SignUpFormValues, 'password'>({ name: 'password' }) ?? '';
  const { touchedFields } = useFormState<SignUpFormValues>({ name: 'password' });
  const touched = Boolean(touchedFields.password);

  return (
    <List id={id} aria-label="Password requirements">
      {passwordRules.map((rule) => {
        const met = rule.test(value);

        return (
          <Item key={rule.id} $state={ruleState(met, touched)}>
            <RequirementCheckIcon size={16} />
            <span>{rule.label}</span>
            <Status>{met ? 'met' : 'not met'}</Status>
          </Item>
        );
      })}
    </List>
  );
}
