'use client';

import styled from 'styled-components';

import { CustomForm } from '@/shared/form';
import { Checkbox, CustomFormInput, FormError, Link, SubmitButton } from '@/shared/ui';

import { useRegistration } from '../model';
import { PasswordField } from './PasswordField';
import { PhoneField } from './PhoneField';

const Stack = styled.div`
  display: flex;
  width: ${({ theme }) => theme.sizes.contentWidth};
  flex-direction: column;
`;

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const NameRow = styled.div`
  display: flex;
  gap: 14px;
`;

const NameInput = styled(CustomFormInput)`
  width: 280px;
`;

const Terms = styled(Checkbox)`
  margin-top: ${({ theme }) => theme.spacing[6]};
`;

const SubmitError = styled(FormError)`
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const CreateAccountButton = styled(SubmitButton)`
  width: 279px;
  margin-top: 60px;
  align-self: center;
`;

export function SignUpForm() {
  const { form, onSubmit, formError } = useRegistration();

  return (
    <CustomForm form={form} onSubmit={onSubmit}>
      <Stack>
        <Fields>
          <NameRow>
            <NameInput name="firstName" label="First name" autoComplete="given-name" />
            <NameInput name="lastName" label="Last name" autoComplete="family-name" />
          </NameRow>
          <PhoneField />
          <CustomFormInput
            name="email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
          />
          <PasswordField name="password" label="Set password" withChecklist />
          <PasswordField name="confirmPassword" label="Confirm password" />
        </Fields>
        <Terms
          name="termsAccepted"
          label={
            <>
              I agree to the{' '}
              <Link external href="#">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link external href="#">
                Privacy Policy
              </Link>
            </>
          }
        />
        <SubmitError>{formError}</SubmitError>
        <CreateAccountButton>Create account</CreateAccountButton>
      </Stack>
    </CustomForm>
  );
}
