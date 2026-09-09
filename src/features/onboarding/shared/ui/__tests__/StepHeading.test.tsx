import { renderWithTheme, screen } from '@/test-utils';

import { StepHeading } from '../StepHeading';

describe('StepHeading', () => {
  it('shows the title as the heading of the step', () => {
    renderWithTheme(<StepHeading title="Create your GloPros account" />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Create your GloPros account' }),
    ).toBeInTheDocument();
  });

  it('shows the subtitle under the title', () => {
    renderWithTheme(
      <StepHeading
        title="Create your GloPros account"
        subtitle="One profile for freelance, permanent, and payroll roles across Europe."
      />,
    );

    expect(
      screen.getByText('One profile for freelance, permanent, and payroll roles across Europe.'),
    ).toBeInTheDocument();
  });
});
