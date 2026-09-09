import { renderWithTheme, screen } from '@/test-utils';

import { Button } from '../Button';

describe('Button', () => {
  it('defaults to type button when no type is given', () => {
    renderWithTheme(<Button>Create account</Button>);

    expect(screen.getByRole('button', { name: 'Create account' })).toHaveAttribute(
      'type',
      'button',
    );
  });

  it('shows a busy, disabled state while loading and keeps the label visible', () => {
    renderWithTheme(<Button loading>Create account</Button>);

    const button = screen.getByRole('button', { name: 'Create account' });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
