import userEvent from '@testing-library/user-event';

import { renderWithTheme, screen } from '@/test-utils';

import { useCompletion } from '../../model';
import { SuccessScreen } from '../SuccessScreen';

jest.mock('../../model');

const useCompletionMock = jest.mocked(useCompletion);

const completion = (fileName: string | null, finish = jest.fn()) => {
  useCompletionMock.mockReturnValue({ fileName, finish });

  return finish;
};

describe('SuccessScreen', () => {
  it('confirms that the account is ready', () => {
    completion('cv.pdf');

    renderWithTheme(<SuccessScreen />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Your account is ready' }),
    ).toBeInTheDocument();
  });

  it('shows the name of the CV on file', () => {
    completion('cv.pdf');

    renderWithTheme(<SuccessScreen />);

    expect(screen.getByText('cv.pdf')).toBeInTheDocument();
  });

  it('shows no file name while there is none', () => {
    completion(null);

    renderWithTheme(<SuccessScreen />);

    expect(screen.getByText("We'll read your CV to prefill your profile.")).toBeInTheDocument();
    expect(screen.queryByText('cv.pdf')).not.toBeInTheDocument();
  });

  it('closes the flow when Finish is clicked', async () => {
    const user = userEvent.setup();
    const finish = completion('cv.pdf');
    renderWithTheme(<SuccessScreen />);

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(finish).toHaveBeenCalledTimes(1);
  });
});
