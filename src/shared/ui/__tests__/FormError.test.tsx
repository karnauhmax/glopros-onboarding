import { renderWithTheme, screen } from '@/test-utils';

import { FormError } from '../FormError';

describe('FormError', () => {
  it('renders nothing when it has no children', () => {
    renderWithTheme(<FormError />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('announces the message it is given', () => {
    renderWithTheme(<FormError>Something went wrong. Please try again.</FormError>);

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
  });
});
