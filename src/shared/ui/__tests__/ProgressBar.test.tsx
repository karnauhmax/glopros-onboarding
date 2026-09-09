import { renderWithTheme, screen } from '@/test-utils';

import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
  it('reports the value it is given under its accessible name', () => {
    renderWithTheme(<ProgressBar value={1} max={3} label="Onboarding progress" />);

    const progressbar = screen.getByRole('progressbar', { name: 'Onboarding progress' });

    expect(progressbar).toHaveValue(1);
  });

  it('clamps a value above max down to max', () => {
    renderWithTheme(<ProgressBar value={5} max={3} label="Onboarding progress" />);

    const progressbar = screen.getByRole('progressbar', { name: 'Onboarding progress' });

    expect(progressbar).toHaveValue(3);
  });

  it('clamps a negative value up to zero', () => {
    renderWithTheme(<ProgressBar value={-2} max={3} label="Onboarding progress" />);

    const progressbar = screen.getByRole('progressbar', { name: 'Onboarding progress' });

    expect(progressbar).toHaveValue(0);
  });

  it('renders without throwing and reports zero progress when max is zero', () => {
    renderWithTheme(<ProgressBar value={1} max={0} label="Onboarding progress" />);

    const progressbar = screen.getByRole('progressbar', { name: 'Onboarding progress' });

    expect(progressbar).toHaveValue(0);
  });
});
