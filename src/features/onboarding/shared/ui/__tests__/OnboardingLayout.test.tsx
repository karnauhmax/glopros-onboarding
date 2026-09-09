import { createRouterMock, renderWithTheme, screen } from '@/test-utils';

import type { OnboardingSnapshot } from '../../storage';
import { OnboardingLayout } from '../OnboardingLayout';

const mockRouter = createRouterMock();
let mockPathname = '/onboarding/sign-up';
let mockSnapshot: OnboardingSnapshot = { registration: null, cvUpload: null };

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => mockRouter,
}));

jest.mock('../../storage', () => ({
  onboardingStorage: { getSnapshot: () => mockSnapshot },
}));

function renderLayout() {
  renderWithTheme(<OnboardingLayout>Step content</OnboardingLayout>);
}

function arriveAtCvUpload() {
  mockSnapshot = { registration: { userId: 'user-1' }, cvUpload: null };
  mockPathname = '/onboarding/cv-upload';
}

function arriveAtSuccess() {
  mockSnapshot = {
    registration: { userId: 'user-1' },
    cvUpload: { fileId: 'file-1', fileName: 'cv.pdf' },
  };
  mockPathname = '/onboarding/success';
}

describe('OnboardingLayout', () => {
  beforeEach(() => {
    mockPathname = '/onboarding/sign-up';
    mockSnapshot = { registration: null, cvUpload: null };
  });

  it('shows the step of the current route in the progress bar', () => {
    renderLayout();

    const progressbar = screen.getByRole('progressbar', { name: 'Onboarding progress' });

    expect(progressbar).toHaveValue(1);
    expect(progressbar).toHaveAttribute('aria-valuemax', '3');
    expect(progressbar).toHaveAttribute('aria-valuetext', 'Step 1 of 3');
  });

  it('counts the progress up on the next step', () => {
    arriveAtCvUpload();

    renderLayout();

    const progressbar = screen.getByRole('progressbar', { name: 'Onboarding progress' });

    expect(progressbar).toHaveValue(2);
    expect(progressbar).toHaveAttribute('aria-valuetext', 'Step 2 of 3');
  });

  it('shows the GloPros logo', () => {
    renderLayout();

    expect(screen.getByRole('img', { name: 'GloPros' })).toBeInTheDocument();
  });

  it('renders the step it wraps', () => {
    renderLayout();

    expect(screen.getByText('Step content')).toBeInTheDocument();
  });

  it('offers no way back from the first step', () => {
    renderLayout();

    expect(screen.queryByRole('link', { name: 'Go back' })).not.toBeInTheDocument();
  });

  it('links back to the previous step from the second one', () => {
    arriveAtCvUpload();

    renderLayout();

    expect(screen.getByRole('link', { name: 'Go back' })).toHaveAttribute(
      'href',
      '/onboarding/sign-up',
    );
  });

  it('fills the progress bar and offers no way back on the last step', () => {
    arriveAtSuccess();

    renderLayout();

    expect(screen.getByRole('progressbar', { name: 'Onboarding progress' })).toHaveAttribute(
      'aria-valuetext',
      'Step 3 of 3',
    );
    expect(screen.queryByRole('link', { name: 'Go back' })).not.toBeInTheDocument();
  });
});
