'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type FieldPath, type SubmitHandler, useForm, type UseFormReturn } from 'react-hook-form';

import type { RegistrationRequest, RegistrationResponse } from '@/features/onboarding/api';
import { onboardingService } from '@/features/onboarding/api';
import type { Draft } from '@/features/onboarding/shared';
import {
  GENERIC_ERROR_MESSAGE,
  getFirstUnfinishedStep,
  onboardingStorage,
} from '@/features/onboarding/shared';

import { emptySignUpValues, type SignUpFormValues, signUpSchema } from '../validation';

type ServerField = keyof NonNullable<
  Extract<RegistrationResponse, { status: 'error' }>['fieldErrors']
>;

const FIELD_PATHS = {
  email: 'email',
  phone: 'phone.number',
  password: 'password',
} as const satisfies Record<ServerField, FieldPath<SignUpFormValues>>;

const SERVER_FIELDS = ['email', 'phone', 'password'] as const satisfies readonly ServerField[];

const REVALIDATE_ON_CHANGE: Partial<Record<string, FieldPath<SignUpFormValues>>> = {
  password: 'confirmPassword',
  'phone.country': 'phone.number',
};

function toDraft(values: SignUpFormValues): Draft {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: { country: values.phone.country, number: values.phone.number },
    termsAccepted: values.termsAccepted,
  };
}

export function useRegistration(): {
  form: UseFormReturn<SignUpFormValues, unknown, RegistrationRequest>;
  onSubmit: SubmitHandler<RegistrationRequest>;
  formError: string | null;
} {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const pendingFocus = useRef<FieldPath<SignUpFormValues> | null>(null);

  const form = useForm<SignUpFormValues, unknown, RegistrationRequest>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
    defaultValues: emptySignUpValues,
  });

  useEffect(() => {
    form.reset({ ...emptySignUpValues, ...onboardingStorage.readDraft() });
  }, [form]);

  useEffect(
    () =>
      form.subscribe({
        formState: { values: true },
        callback: ({ values, name }) => {
          onboardingStorage.saveDraft(toDraft(values));

          const dependent = name ? REVALIDATE_ON_CHANGE[name] : undefined;

          if (dependent && form.getValues(dependent)) {
            void form.trigger(dependent);
          }
        },
      }),
    [form],
  );

  const { isSubmitting } = form.formState;

  // Not in the submit handler: the fieldset is still disabled there and `.focus()` does nothing.
  useEffect(() => {
    if (!isSubmitting && pendingFocus.current) {
      form.setFocus(pendingFocus.current);
      pendingFocus.current = null;
    }
  }, [form, isSubmitting]);

  const onSubmit = useCallback<SubmitHandler<RegistrationRequest>>(
    async (request) => {
      setFormError(null);

      try {
        const response = await onboardingService.register(request);

        if (response.status === 'ok') {
          onboardingStorage.clearCvUpload();
          onboardingStorage.saveRegistration({ userId: response.userId });
          router.push(getFirstUnfinishedStep(onboardingStorage.getSnapshot()).path);

          return;
        }

        if (response.fieldErrors) {
          let firstRejected: FieldPath<SignUpFormValues> | null = null;

          for (const field of SERVER_FIELDS) {
            const message = response.fieldErrors[field];

            if (message) {
              form.setError(FIELD_PATHS[field], { type: 'server', message });
              firstRejected ??= FIELD_PATHS[field];
            }
          }

          if (firstRejected) {
            pendingFocus.current = firstRejected;

            return;
          }
        }

        setFormError(response.message ?? GENERIC_ERROR_MESSAGE);
      } catch {
        setFormError(GENERIC_ERROR_MESSAGE);
      }
    },
    [form, router],
  );

  return { form, onSubmit, formError };
}
