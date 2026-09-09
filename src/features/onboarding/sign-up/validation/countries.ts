import { getCountryCallingCode } from 'libphonenumber-js/max';

import type { Country } from '@/features/onboarding/api';

export const COUNTRY_CODES = ['NL', 'PL', 'UA'] as const satisfies readonly Country[];

export const DEFAULT_COUNTRY: Country = 'NL';

export type CountryOption = {
  code: Country;
  label: string;
  placeholder: string;
  hint: string;
  flagSrc: string;
};

const buildCountryOption = (
  code: Country,
  label: string,
  nationalDigits: number,
  placeholder: string,
): CountryOption => ({
  code,
  label,
  placeholder,
  hint: `+${getCountryCallingCode(code)} · ${nationalDigits} digits`,
  flagSrc: `/icons/flag-${code.toLowerCase()}.svg`,
});

const countryOptionsByCode: Record<Country, CountryOption> = {
  NL: buildCountryOption('NL', 'Netherlands', 9, '6 12345678'),
  PL: buildCountryOption('PL', 'Poland', 9, '512 345 678'),
  UA: buildCountryOption('UA', 'Ukraine', 9, '50 123 4567'),
};

export const countries: readonly CountryOption[] = COUNTRY_CODES.map(
  (code) => countryOptionsByCode[code],
);

export function getCountry(code: Country): CountryOption {
  return countryOptionsByCode[code];
}
