import { passwordSchema } from '../password';

describe('passwordSchema', () => {
  it('accepts a password that satisfies every rule', () => {
    const result = passwordSchema.safeParse('Password1');

    expect(result.success).toBe(true);
  });

  it('rejects a password without an upper case letter, reporting the case rule', () => {
    const result = passwordSchema.safeParse('password1');

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toStrictEqual([
      'Letters (uppercase & lowercase)',
    ]);
  });

  it('rejects a password without a lower case letter, reporting the case rule', () => {
    const result = passwordSchema.safeParse('PASSWORD1');

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toStrictEqual([
      'Letters (uppercase & lowercase)',
    ]);
  });

  it('rejects a password without a digit, reporting the number rule', () => {
    const result = passwordSchema.safeParse('Passwordd');

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toStrictEqual(['Number']);
  });

  it('rejects a password shorter than nine characters, reporting the length rule', () => {
    const result = passwordSchema.safeParse('Pass1');

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toStrictEqual(['9+ characters']);
  });
});
