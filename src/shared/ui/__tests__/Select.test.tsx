import userEvent from '@testing-library/user-event';

import { renderWithTheme, screen } from '@/test-utils';

import { Select, type SelectOption } from '../Select';

const countries: SelectOption[] = [
  { value: 'NL', label: 'Netherlands' },
  { value: 'PL', label: 'Poland' },
  { value: 'UA', label: 'Ukraine' },
];

const countriesWithFlag: SelectOption[] = [
  { value: 'NL', label: 'Netherlands', icon: <span>NL-flag</span> },
  { value: 'PL', label: 'Poland' },
  { value: 'UA', label: 'Ukraine' },
];

describe('Select', () => {
  it('names the select with its visually hidden label', () => {
    renderWithTheme(<Select label="Country" options={countries} value="NL" onChange={jest.fn()} />);

    expect(screen.getByRole('combobox', { name: 'Country' })).toBe(
      screen.getByLabelText('Country'),
    );
  });

  it('renders an option for every entry of options', () => {
    renderWithTheme(<Select label="Country" options={countries} value="NL" onChange={jest.fn()} />);

    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('option', { name: 'Netherlands' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Poland' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Ukraine' })).toBeInTheDocument();
  });

  it('reports the option the user picks through onChange', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn((event) => event.target.value);
    renderWithTheme(
      <Select label="Country" options={countries} value="NL" onChange={handleChange} />,
    );

    await user.selectOptions(screen.getByLabelText('Country'), 'PL');

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveReturnedWith('PL');
  });

  it('shows the icon of the selected option', () => {
    renderWithTheme(
      <Select label="Country" options={countriesWithFlag} value="NL" onChange={jest.fn()} />,
    );

    expect(screen.getByText('NL-flag')).toBeInTheDocument();
  });

  it('shows the label of the selected option when that option has no icon', () => {
    const { rerender } = renderWithTheme(
      <Select label="Country" options={countriesWithFlag} value="NL" onChange={jest.fn()} />,
    );

    rerender(
      <Select label="Country" options={countriesWithFlag} value="PL" onChange={jest.fn()} />,
    );

    expect(screen.queryByText('NL-flag')).not.toBeInTheDocument();
    expect(screen.getByText('Poland', { ignore: 'option' })).toBeInTheDocument();
  });

  it('marks the select invalid for assistive technology', () => {
    renderWithTheme(
      <Select label="Country" options={countries} value="NL" onChange={jest.fn()} invalid />,
    );

    expect(screen.getByLabelText('Country')).toHaveAttribute('aria-invalid', 'true');
  });
});
