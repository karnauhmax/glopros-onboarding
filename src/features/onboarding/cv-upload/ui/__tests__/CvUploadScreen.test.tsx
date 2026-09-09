import userEvent from '@testing-library/user-event';

import type { Deferred } from '@/test-utils';
import { act, createDeferred, createRouterMock, renderWithTheme, screen } from '@/test-utils';
import { createCvFileFixture } from '@/test-utils/fixtures';

import type { CvUploadResponse } from '../../../api';
import { onboardingService } from '../../../api';
import { CvUploadScreen } from '../CvUploadScreen';

const mockRouter = createRouterMock();

jest.mock('../../../api');
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/onboarding/cv-upload',
}));

const uploadCvMock = jest.mocked(onboardingService.uploadCv);

const OVER_TEN_MEGABYTES = 10485761;

const storeRegistration = () =>
  sessionStorage.setItem('onboarding.registration', JSON.stringify({ userId: 'user-1' }));

const pickFile = (user: ReturnType<typeof userEvent.setup>, name = 'cv.pdf') =>
  user.upload(screen.getByLabelText('Upload CV'), createCvFileFixture(name));

describe('CvUploadScreen', () => {
  let heldUpload: Deferred<CvUploadResponse>;

  const holdUpload = () => {
    uploadCvMock.mockReturnValue(heldUpload.promise);
  };

  beforeEach(() => {
    sessionStorage.clear();
    heldUpload = createDeferred<CvUploadResponse>();
  });

  afterEach(async () => {
    await act(async () => {
      heldUpload.resolve({ status: 'ok', fileId: 'file-1', fileName: 'cv.pdf' });
    });
  });

  it('offers the empty drop zone with the prompt, the button and the size hint', () => {
    renderWithTheme(<CvUploadScreen />);

    expect(screen.getByText('Drag & drop CV or')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload CV' })).toBeInTheDocument();
    expect(screen.getByText('PDF, DOC or DOCX up to 10 MB')).toBeInTheDocument();
  });

  it('keeps Continue disabled while no file has been uploaded', () => {
    renderWithTheme(<CvUploadScreen />);

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('shows the file next to a waiting indicator while the upload is in flight', async () => {
    const user = userEvent.setup();
    storeRegistration();
    holdUpload();
    renderWithTheme(<CvUploadScreen />);

    await pickFile(user);

    const waiting = await screen.findByRole('status');
    expect(waiting).toHaveTextContent('cv.pdf');
    expect(waiting).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('starts no second upload while the first one is in flight', async () => {
    const user = userEvent.setup();
    storeRegistration();
    holdUpload();
    renderWithTheme(<CvUploadScreen />);
    await pickFile(user);
    await screen.findByRole('status');

    await pickFile(user, 'resume.pdf');

    expect(uploadCvMock).toHaveBeenCalledTimes(1);
  });

  it('shows the uploaded file with both ways out once the upload succeeds', async () => {
    const user = userEvent.setup();
    storeRegistration();
    uploadCvMock.mockResolvedValue({ status: 'ok', fileId: 'file-1', fileName: 'cv.pdf' });
    renderWithTheme(<CvUploadScreen />);

    await pickFile(user);

    expect(await screen.findByText('cv.pdf')).toBeInTheDocument();
    expect(screen.getByText("We'll read your CV to prefill your profile.")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Replace' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  it('shows the message a failed upload came back with', async () => {
    const user = userEvent.setup();
    storeRegistration();
    uploadCvMock.mockResolvedValue({
      status: 'error',
      fileName: 'cv.pdf',
      message: 'Upload failed. Please try again.',
    });
    renderWithTheme(<CvUploadScreen />);

    await pickFile(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('Upload failed. Please try again.');
    expect(screen.getByText('cv.pdf')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('tells the file input why it is invalid', async () => {
    const user = userEvent.setup();
    storeRegistration();
    uploadCvMock.mockResolvedValue({
      status: 'error',
      fileName: 'cv.pdf',
      message: 'Upload failed. Please try again.',
    });
    renderWithTheme(<CvUploadScreen />);

    await pickFile(user);

    expect(await screen.findByLabelText('Upload CV')).toHaveAccessibleDescription(
      'Upload failed. Please try again.',
    );
  });

  it('refuses a file of the wrong format without asking the service', async () => {
    const user = userEvent.setup({ applyAccept: false });
    storeRegistration();
    renderWithTheme(<CvUploadScreen />);

    await pickFile(user, 'cv.txt');

    expect(await screen.findByText('Use a PDF, DOC or DOCX file.')).toBeInTheDocument();
    expect(uploadCvMock).not.toHaveBeenCalled();
  });

  it('refuses a file larger than 10 MB without asking the service', async () => {
    const user = userEvent.setup();
    storeRegistration();
    const file = createCvFileFixture('big.pdf');
    Object.defineProperty(file, 'size', { value: OVER_TEN_MEGABYTES });
    renderWithTheme(<CvUploadScreen />);

    await user.upload(screen.getByLabelText('Upload CV'), file);

    expect(await screen.findByText('This file is larger than 10 MB.')).toBeInTheDocument();
    expect(screen.getByText('big.pdf')).toBeInTheDocument();
    expect(uploadCvMock).not.toHaveBeenCalled();
  });

  it('returns to the empty drop zone when the file is removed', async () => {
    const user = userEvent.setup();
    storeRegistration();
    uploadCvMock.mockResolvedValue({ status: 'ok', fileId: 'file-1', fileName: 'cv.pdf' });
    renderWithTheme(<CvUploadScreen />);
    await pickFile(user);

    await user.click(await screen.findByRole('button', { name: 'Remove' }));

    expect(screen.getByText('Drag & drop CV or')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('moves on to the next step when Continue is clicked', async () => {
    const user = userEvent.setup();
    storeRegistration();
    uploadCvMock.mockResolvedValue({ status: 'ok', fileId: 'file-1', fileName: 'cv.pdf' });
    renderWithTheme(<CvUploadScreen />);
    await pickFile(user);
    await screen.findByRole('button', { name: 'Replace' });

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith('/onboarding/success');
  });
});
