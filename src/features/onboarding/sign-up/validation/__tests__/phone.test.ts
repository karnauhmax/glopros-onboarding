import { normalizePhone } from '../phone';

describe('normalizePhone', () => {
  it('normalizes a plain national NL number', () => {
    const result = normalizePhone('612345678', 'NL');

    expect(result).toStrictEqual({ national: '612345678' });
  });

  it('normalizes an NL number with spaces', () => {
    const result = normalizePhone('6 12 34 56 78', 'NL');

    expect(result).toStrictEqual({ national: '612345678' });
  });

  it('normalizes an NL number entered with its country code', () => {
    const result = normalizePhone('+31 6 12345678', 'NL');

    expect(result).toStrictEqual({ national: '612345678' });
  });

  it('returns null for a number that is too short for NL', () => {
    const result = normalizePhone('12345', 'NL');

    expect(result).toBeNull();
  });

  it('returns null when the number belongs to a different country than selected', () => {
    const result = normalizePhone('+48 512 345 678', 'NL');

    expect(result).toBeNull();
  });

  it('normalizes a valid PL number', () => {
    const result = normalizePhone('512345678', 'PL');

    expect(result).toStrictEqual({ national: '512345678' });
  });

  it('normalizes a valid UA number', () => {
    const result = normalizePhone('501234567', 'UA');

    expect(result).toStrictEqual({ national: '501234567' });
  });
});
