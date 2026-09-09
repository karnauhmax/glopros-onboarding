import { createSignUpFormValuesFixture } from '../../__tests__/fixtures';
import { emptySignUpValues, signUpSchema } from '../sign-up-schema';

type ParseResult = ReturnType<typeof signUpSchema.safeParse>;

const issueFor = (result: ParseResult, path: string) =>
  result.error?.issues.find((issue) => issue.path.join('.') === path);

describe('emptySignUpValues', () => {
  it('starts every text field empty, the country as NL and the terms unchecked', () => {
    expect(emptySignUpValues).toStrictEqual({
      firstName: '',
      lastName: '',
      email: '',
      phone: { country: 'NL', number: '' },
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    });
  });
});

describe('signUpSchema', () => {
  it('trims names and email, normalizes the phone number and drops confirmPassword', () => {
    const values = createSignUpFormValuesFixture({
      firstName: '  Ada  ',
      lastName: 'Lovelace',
      email: ' ada@example.com ',
      phone: { country: 'NL', number: '6 12 34 56 78' },
      password: 'Password1',
      confirmPassword: 'Password1',
      termsAccepted: true,
    });

    const result = signUpSchema.parse(values);

    expect(result).toStrictEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: { country: 'NL', number: '612345678' },
      password: 'Password1',
      termsAccepted: true,
    });
  });

  describe('first name', () => {
    it('reports "Enter your first name" as the first issue for an empty value', () => {
      const values = createSignUpFormValuesFixture({ firstName: '' });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]).toMatchObject({
        path: ['firstName'],
        message: 'Enter your first name',
      });
    });

    it('rejects a single character with "Must be at least 2 characters"', () => {
      const values = createSignUpFormValuesFixture({ firstName: 'A' });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      expect(issueFor(result, 'firstName')?.message).toBe('Must be at least 2 characters');
    });

    it('rejects 51 characters with "Must be 50 characters or fewer"', () => {
      const values = createSignUpFormValuesFixture({ firstName: 'a'.repeat(51) });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      expect(issueFor(result, 'firstName')?.message).toBe('Must be 50 characters or fewer');
    });

    it('rejects digits with "Use letters, spaces, hyphens or apostrophes only"', () => {
      const values = createSignUpFormValuesFixture({ firstName: 'Ann3' });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      expect(issueFor(result, 'firstName')?.message).toBe(
        'Use letters, spaces, hyphens or apostrophes only',
      );
    });

    it('rejects a value that only ends in letters, such as "3Ann"', () => {
      const values = createSignUpFormValuesFixture({ firstName: '3Ann' });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      expect(issueFor(result, 'firstName')?.message).toBe(
        'Use letters, spaces, hyphens or apostrophes only',
      );
    });

    it('accepts letters from another alphabet with hyphens and apostrophes', () => {
      const values = createSignUpFormValuesFixture({ firstName: "Анна-Мария O'Neil" });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(true);
    });
  });

  describe('last name', () => {
    it('reports "Enter your last name" for an empty value', () => {
      const values = createSignUpFormValuesFixture({ lastName: '' });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      expect(issueFor(result, 'lastName')?.message).toBe('Enter your last name');
    });
  });

  describe('email', () => {
    it('rejects an address without a domain with "Enter a valid email address"', () => {
      const values = createSignUpFormValuesFixture({ email: 'ada@' });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      expect(issueFor(result, 'email')?.message).toBe('Enter a valid email address');
    });

    it('reports only "Enter your email" for an empty value', () => {
      const values = createSignUpFormValuesFixture({ email: '' });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      const emailIssues = result.error?.issues.filter((issue) => issue.path.join('.') === 'email');
      expect(emailIssues).toStrictEqual([expect.objectContaining({ message: 'Enter your email' })]);
    });
  });

  describe('phone', () => {
    it('reports "Enter a valid phone number for Netherlands" at phone.number for a too-short NL number', () => {
      const values = createSignUpFormValuesFixture({ phone: { country: 'NL', number: '12345' } });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      expect(issueFor(result, 'phone.number')?.message).toBe(
        'Enter a valid phone number for Netherlands',
      );
    });

    it('reports "Enter your phone number" at phone.number for an empty PL number', () => {
      const values = createSignUpFormValuesFixture({ phone: { country: 'PL', number: '' } });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      expect(issueFor(result, 'phone.number')?.message).toBe('Enter your phone number');
    });

    it('treats a number made of spaces as empty', () => {
      const values = createSignUpFormValuesFixture({ phone: { country: 'NL', number: '   ' } });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      expect(issueFor(result, 'phone.number')?.message).toBe('Enter your phone number');
    });

    it('reports "Enter a valid phone number for Ukraine" at phone.number for an invalid UA number', () => {
      const values = createSignUpFormValuesFixture({ phone: { country: 'UA', number: '1' } });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      expect(issueFor(result, 'phone.number')?.message).toBe(
        'Enter a valid phone number for Ukraine',
      );
    });
  });

  describe('termsAccepted', () => {
    it('reports "You must accept the terms" when unchecked', () => {
      const values = createSignUpFormValuesFixture({ termsAccepted: false });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      expect(issueFor(result, 'termsAccepted')?.message).toBe('You must accept the terms');
    });
  });

  describe('confirmPassword', () => {
    it('reports "Confirm your password" when empty', () => {
      const values = createSignUpFormValuesFixture({ confirmPassword: '' });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      expect(issueFor(result, 'confirmPassword')?.message).toBe('Confirm your password');
    });

    it('reports "Passwords do not match" when it differs from the password', () => {
      const values = createSignUpFormValuesFixture({
        password: 'Password1',
        confirmPassword: 'Password2',
      });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      expect(issueFor(result, 'confirmPassword')?.message).toBe('Passwords do not match');
    });

    it('still reports the mismatch when the phone number is invalid at the same time', () => {
      const values = createSignUpFormValuesFixture({
        phone: { country: 'NL', number: '12345' },
        password: 'Password1',
        confirmPassword: 'Password2',
      });

      const result = signUpSchema.safeParse(values);

      expect(result.success).toBe(false);
      expect(issueFor(result, 'phone.number')?.message).toBe(
        'Enter a valid phone number for Netherlands',
      );
      expect(issueFor(result, 'confirmPassword')?.message).toBe('Passwords do not match');
    });
  });
});
