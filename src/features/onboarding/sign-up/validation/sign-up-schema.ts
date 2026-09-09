import { z } from 'zod';

import type { Country, RegistrationRequest } from '@/features/onboarding/api';

import { COUNTRY_CODES, DEFAULT_COUNTRY, getCountry } from './countries';
import { passwordSchema } from './password';
import { normalizePhone } from './phone';

export type SignUpFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: { country: Country; number: string };
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

export const emptySignUpValues: SignUpFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: { country: DEFAULT_COUNTRY, number: '' },
  password: '',
  confirmPassword: '',
  termsAccepted: false,
};

const nameSchema = (requiredMessage: string) =>
  z
    .string()
    .trim()
    .min(1, requiredMessage)
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Must be 50 characters or fewer')
    .regex(/^[\p{L}\s'’-]+$/u, 'Use letters, spaces, hyphens or apostrophes only');

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Enter your email')
  .pipe(z.email({ pattern: z.regexes.html5Email, error: 'Enter a valid email address' }));

const phoneSchema = z
  .object({
    country: z.enum(COUNTRY_CODES),
    number: z.string().trim().min(1, 'Enter your phone number'),
  })
  .transform((value, ctx) => {
    const normalized = normalizePhone(value.number, value.country);

    if (!normalized) {
      ctx.addIssue({
        code: 'custom',
        path: ['number'],
        message: `Enter a valid phone number for ${getCountry(value.country).label}`,
        continue: true,
      });
      return z.NEVER;
    }

    return { country: value.country, number: normalized.national };
  });

const confirmPasswordSchema = z.string().min(1, 'Confirm your password');

const termsAcceptedSchema = z
  .boolean()
  .refine((value): value is true => value === true, 'You must accept the terms');

export const signUpSchema: z.ZodType<RegistrationRequest, SignUpFormValues> = z
  .object({
    firstName: nameSchema('Enter your first name'),
    lastName: nameSchema('Enter your last name'),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    termsAccepted: termsAcceptedSchema,
  })
  .superRefine((values, ctx) => {
    if (values.confirmPassword && values.confirmPassword !== values.password) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  })
  .transform(({ confirmPassword: _confirmPassword, ...request }) => request);
