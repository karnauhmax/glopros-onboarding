import type { OnboardingSnapshot } from '../storage';

export type StepId = 'sign-up' | 'cv-upload' | 'success';

export interface Step {
  id: StepId;
  path: string;
  isCompleted(snapshot: OnboardingSnapshot): boolean;
}

const signUpStep: Step = {
  id: 'sign-up',
  path: '/onboarding/sign-up',
  isCompleted: (snapshot) => snapshot.registration !== null,
};

const cvUploadStep: Step = {
  id: 'cv-upload',
  path: '/onboarding/cv-upload',
  isCompleted: (snapshot) => snapshot.cvUpload !== null,
};

const successStep: Step = {
  id: 'success',
  path: '/onboarding/success',
  isCompleted: () => false,
};

/** List order is flow order. The index drives the progress bar, the guard and the back link. */
export const steps: readonly Step[] = [signUpStep, cvUploadStep, successStep];

export function getStepByPath(pathname: string): Step | undefined {
  return steps.find((step) => step.path === pathname);
}

export function getStepIndex(id: StepId): number {
  return steps.findIndex((step) => step.id === id);
}

export function getNextStep(id: StepId): Step | undefined {
  return steps[getStepIndex(id) + 1];
}

export function getPreviousStep(id: StepId): Step | undefined {
  return steps[getStepIndex(id) - 1];
}

export function getFirstUnfinishedStep(snapshot: OnboardingSnapshot): Step {
  // Stryker disable next-line ArithmeticOperator: unreachable, the last step never completes
  return steps.find((step) => !step.isCompleted(snapshot)) ?? steps[steps.length - 1];
}

export function canVisit(step: Step, snapshot: OnboardingSnapshot): boolean {
  return getStepIndex(step.id) <= getStepIndex(getFirstUnfinishedStep(snapshot).id);
}
