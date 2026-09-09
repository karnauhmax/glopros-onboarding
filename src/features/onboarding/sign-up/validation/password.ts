import { z } from 'zod';

interface PasswordRule {
  id: 'case' | 'length' | 'number';
  label: string;
  test(value: string): boolean;
}

export const passwordRules: readonly PasswordRule[] = [
  { id: 'length', label: '9+ characters', test: (value) => value.length >= 9 },
  { id: 'number', label: 'Number', test: (value) => /\d/.test(value) },
  {
    id: 'case',
    label: 'Letters (uppercase & lowercase)',
    test: (value) => /\p{Ll}/u.test(value) && /\p{Lu}/u.test(value),
  },
];

export const passwordSchema: z.ZodString = passwordRules.reduce(
  (schema, rule) => schema.refine(rule.test, rule.label),
  z.string(),
);
