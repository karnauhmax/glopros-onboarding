import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

import type { Country } from '@/features/onboarding/api';

export function normalizePhone(input: string, country: Country): { national: string } | null {
  const parsed = parsePhoneNumberFromString(input, country);

  if (!parsed || !parsed.isValid() || parsed.country !== country) {
    return null;
  }

  return { national: parsed.nationalNumber };
}
