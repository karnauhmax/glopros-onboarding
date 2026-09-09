'use client';

import { useController, useFormState } from 'react-hook-form';
import styled from 'styled-components';

import { CustomFormInput, Select, type SelectOption } from '@/shared/ui';

import { countries, getCountry, type SignUpFormValues } from '../validation';

const countryOptions: SelectOption[] = countries.map((country) => ({
  value: country.code,
  label: country.label,
  // eslint-disable-next-line @next/next/no-img-element -- static SVG, next/image adds nothing
  icon: <img src={country.flagSrc} alt="" width={24} height={16} />,
}));

const CountrySelect = styled(Select)`
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;

  &:focus-within {
    z-index: 1;
  }
`;

export function PhoneField() {
  const { field } = useController<SignUpFormValues, 'phone.country'>({ name: 'phone.country' });
  const { errors } = useFormState<SignUpFormValues>({ name: ['phone.number', 'phone.country'] });
  const pairError = errors.phone?.number ?? errors.phone?.country;
  const country = getCountry(field.value);

  return (
    <CustomFormInput
      name="phone.number"
      label="Phone number"
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      placeholder={country.placeholder}
      hint={country.hint}
      error={pairError?.message}
      leading={
        <CountrySelect
          name={field.name}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          label="Country"
          options={countryOptions}
          invalid={Boolean(pairError)}
        />
      }
    />
  );
}
