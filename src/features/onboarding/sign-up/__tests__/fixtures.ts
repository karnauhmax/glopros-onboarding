import type { SignUpFormValues } from '../validation';

export const createSignUpFormValuesFixture = (
  overrides: Partial<SignUpFormValues> = {},
): SignUpFormValues => ({
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: { country: 'NL', number: '612345678' },
  password: 'Password1',
  confirmPassword: 'Password1',
  termsAccepted: true,
  ...overrides,
});
