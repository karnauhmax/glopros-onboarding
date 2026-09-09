import { countries, COUNTRY_CODES, DEFAULT_COUNTRY, getCountry } from '../countries';

describe('COUNTRY_CODES', () => {
  it('lists NL, PL and UA in that order', () => {
    expect(COUNTRY_CODES).toStrictEqual(['NL', 'PL', 'UA']);
  });
});

describe('DEFAULT_COUNTRY', () => {
  it('is the Netherlands', () => {
    expect(DEFAULT_COUNTRY).toBe('NL');
  });
});

describe('countries', () => {
  it('describes the Netherlands option', () => {
    const netherlands = countries[0];

    expect(netherlands).toStrictEqual({
      code: 'NL',
      label: 'Netherlands',
      placeholder: '6 12345678',
      hint: '+31 · 9 digits',
      flagSrc: '/icons/flag-nl.svg',
    });
  });

  it('describes the Poland option', () => {
    const poland = countries[1];

    expect(poland).toStrictEqual({
      code: 'PL',
      label: 'Poland',
      placeholder: '512 345 678',
      hint: '+48 · 9 digits',
      flagSrc: '/icons/flag-pl.svg',
    });
  });

  it('describes the Ukraine option', () => {
    const ukraine = countries[2];

    expect(ukraine).toStrictEqual({
      code: 'UA',
      label: 'Ukraine',
      placeholder: '50 123 4567',
      hint: '+380 · 9 digits',
      flagSrc: '/icons/flag-ua.svg',
    });
  });
});

describe('getCountry', () => {
  it('returns the Poland option for code PL', () => {
    const option = getCountry('PL');

    expect(option.label).toBe('Poland');
  });
});
