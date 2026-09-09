'use client';

import { StepContent, StepHeading } from '@/features/onboarding/shared';

import { SignUpForm } from './SignUpForm';

export function SignUpScreen() {
  return (
    <StepContent>
      <StepHeading
        title="Create your GloPros account"
        subtitle="One profile for freelance, permanent, and payroll roles across Europe."
      />
      <SignUpForm />
    </StepContent>
  );
}
