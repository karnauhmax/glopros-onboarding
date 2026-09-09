import userEvent from '@testing-library/user-event';

import { renderWithTheme, screen } from '@/test-utils';

import { CvUploadCard } from '../CvUploadCard';

const SUCCESS_DESCRIPTION = "We'll read your CV to prefill your profile.";
const ERROR_DESCRIPTION = 'Upload failed. Please try again.';

describe('CvUploadCard', () => {
  it('shows the file name and the description', () => {
    renderWithTheme(
      <CvUploadCard
        fileName="cv.pdf"
        description={SUCCESS_DESCRIPTION}
        tone="success"
        onRemove={jest.fn()}
      />,
    );

    expect(screen.getByText('cv.pdf')).toBeInTheDocument();
    expect(screen.getByText(SUCCESS_DESCRIPTION)).toBeInTheDocument();
  });

  it('removes the file when the user clicks Remove', async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();
    renderWithTheme(
      <CvUploadCard
        fileName="cv.pdf"
        description={SUCCESS_DESCRIPTION}
        tone="success"
        onRemove={onRemove}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('keeps the click on Remove from reaching the box that opens the file dialog', async () => {
    const user = userEvent.setup();
    const onBoxClick = jest.fn();
    renderWithTheme(
      <div onClick={onBoxClick}>
        <CvUploadCard
          fileName="cv.pdf"
          description={SUCCESS_DESCRIPTION}
          tone="success"
          onRemove={jest.fn()}
        />
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(onBoxClick).not.toHaveBeenCalled();
  });

  it('lets the click on Replace reach the box that opens the file dialog', async () => {
    const user = userEvent.setup();
    const onBoxClick = jest.fn();
    renderWithTheme(
      <div onClick={onBoxClick}>
        <CvUploadCard
          fileName="cv.pdf"
          description={SUCCESS_DESCRIPTION}
          tone="success"
          onRemove={jest.fn()}
        />
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Replace' }));

    expect(onBoxClick).toHaveBeenCalledTimes(1);
  });

  it('announces a finished upload as a status', () => {
    renderWithTheme(
      <CvUploadCard
        fileName="cv.pdf"
        description={SUCCESS_DESCRIPTION}
        tone="success"
        onRemove={jest.fn()}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(SUCCESS_DESCRIPTION);
  });

  it('announces a failed upload as an alert', () => {
    renderWithTheme(
      <CvUploadCard
        fileName="cv.pdf"
        description={ERROR_DESCRIPTION}
        tone="error"
        onRemove={jest.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(ERROR_DESCRIPTION);
  });
});
