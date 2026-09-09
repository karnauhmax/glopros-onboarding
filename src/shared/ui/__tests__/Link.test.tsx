import { renderWithTheme, screen } from '@/test-utils';

import { Link } from '../Link';

describe('Link', () => {
  it('opens an external link in a new tab without leaking the opener', () => {
    renderWithTheme(
      <Link external href="https://glopros.example/terms">
        Terms of service
      </Link>,
    );

    const link = screen.getByRole('link', { name: 'Terms of service' });

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('keeps a link without the external flag in the same tab', () => {
    renderWithTheme(<Link href="/privacy">Privacy policy</Link>);

    expect(screen.getByRole('link', { name: 'Privacy policy' })).not.toHaveAttribute('target');
  });
});
