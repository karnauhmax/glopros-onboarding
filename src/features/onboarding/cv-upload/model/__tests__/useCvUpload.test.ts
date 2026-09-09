import type { CvUploadResponse } from '@/features/onboarding/api';
import { onboardingService } from '@/features/onboarding/api';
import { act, createDeferred, renderHook } from '@/test-utils';
import { createCvFileFixture } from '@/test-utils/fixtures';

import { useCvUpload } from '../useCvUpload';

jest.mock('@/features/onboarding/api');

const uploadCvMock = jest.mocked(onboardingService.uploadCv);

const storeRegistration = (userId = 'user-1') =>
  sessionStorage.setItem('onboarding.registration', JSON.stringify({ userId }));

const storeCvUpload = (fileId: string, fileName: string) =>
  sessionStorage.setItem('onboarding.cvUpload', JSON.stringify({ fileId, fileName }));

const readStoredCvUpload = () => sessionStorage.getItem('onboarding.cvUpload');

const deferUpload = () => {
  const upload = createDeferred<CvUploadResponse>();

  uploadCvMock.mockReturnValueOnce(upload.promise);

  return upload;
};

describe('useCvUpload', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('starts empty when storage holds no upload', () => {
    const { result } = renderHook(() => useCvUpload());

    expect(result.current.state).toStrictEqual({ kind: 'empty' });
  });

  it('lifts a stored upload into a success state on mount', () => {
    storeCvUpload('file-1', 'cv.pdf');

    const { result } = renderHook(() => useCvUpload());

    expect(result.current.state).toStrictEqual({
      kind: 'success',
      fileId: 'file-1',
      fileName: 'cv.pdf',
    });
  });

  it('rejects a file the validation refuses without calling the service', async () => {
    storeRegistration();
    const { result } = renderHook(() => useCvUpload());

    await act(() => result.current.selectFile(createCvFileFixture('cv.txt')));

    expect(result.current.state).toStrictEqual({
      kind: 'error',
      fileName: 'cv.txt',
      message: 'Use a PDF, DOC or DOCX file.',
    });
    expect(uploadCvMock).not.toHaveBeenCalled();
  });

  it('checks the file before the registration, so a refused file keeps its own message', async () => {
    const { result } = renderHook(() => useCvUpload());

    await act(() => result.current.selectFile(createCvFileFixture('cv.txt')));

    expect(result.current.state).toStrictEqual({
      kind: 'error',
      fileName: 'cv.txt',
      message: 'Use a PDF, DOC or DOCX file.',
    });
  });

  it('reports the file as uploading while the request is in flight', async () => {
    storeRegistration();
    deferUpload();
    const { result } = renderHook(() => useCvUpload());

    await act(async () => {
      void result.current.selectFile(createCvFileFixture());
    });

    expect(result.current.state).toStrictEqual({ kind: 'uploading', fileName: 'cv.pdf' });
    expect(readStoredCvUpload()).toBeNull();
  });

  it('stores the uploaded file and reports it as a success', async () => {
    storeRegistration();
    uploadCvMock.mockResolvedValue({ status: 'ok', fileId: 'file-1', fileName: 'cv.pdf' });
    const { result } = renderHook(() => useCvUpload());

    await act(() => result.current.selectFile(createCvFileFixture()));

    expect(result.current.state).toStrictEqual({
      kind: 'success',
      fileId: 'file-1',
      fileName: 'cv.pdf',
    });
    expect(readStoredCvUpload()).toBe('{"fileId":"file-1","fileName":"cv.pdf"}');
  });

  it('keeps the message of a failed upload and stores nothing', async () => {
    storeRegistration();
    uploadCvMock.mockResolvedValue({
      status: 'error',
      fileName: 'cv.pdf',
      message: 'Upload failed. Please try again.',
    });
    const { result } = renderHook(() => useCvUpload());

    await act(() => result.current.selectFile(createCvFileFixture()));

    expect(result.current.state).toStrictEqual({
      kind: 'error',
      fileName: 'cv.pdf',
      message: 'Upload failed. Please try again.',
    });
    expect(readStoredCvUpload()).toBeNull();
  });

  it('sends the stored user id together with the file', async () => {
    storeRegistration('user-7');
    uploadCvMock.mockResolvedValue({ status: 'ok', fileId: 'file-1', fileName: 'cv.pdf' });
    const file = createCvFileFixture();
    const { result } = renderHook(() => useCvUpload());

    await act(() => result.current.selectFile(file));

    expect(uploadCvMock).toHaveBeenCalledTimes(1);
    expect(uploadCvMock).toHaveBeenCalledWith({ userId: 'user-7', file });
  });

  it('refuses the upload with the generic error when no registration is stored', async () => {
    const { result } = renderHook(() => useCvUpload());

    await act(() => result.current.selectFile(createCvFileFixture()));

    expect(result.current.state).toStrictEqual({
      kind: 'error',
      fileName: 'cv.pdf',
      message: 'Something went wrong. Please try again.',
    });
    expect(uploadCvMock).not.toHaveBeenCalled();
  });

  it('clears the stored upload and goes back to empty when the file is removed', () => {
    storeCvUpload('file-1', 'cv.pdf');
    const { result } = renderHook(() => useCvUpload());

    act(() => {
      result.current.remove();
    });

    expect(result.current.state).toStrictEqual({ kind: 'empty' });
    expect(readStoredCvUpload()).toBeNull();
  });

  it('keeps only the last upload when a second file replaces a successful one', async () => {
    storeRegistration();
    uploadCvMock
      .mockResolvedValueOnce({ status: 'ok', fileId: 'file-1', fileName: 'cv.pdf' })
      .mockResolvedValueOnce({ status: 'ok', fileId: 'file-2', fileName: 'resume.pdf' });
    const { result } = renderHook(() => useCvUpload());
    await act(() => result.current.selectFile(createCvFileFixture()));

    await act(() => result.current.selectFile(createCvFileFixture('resume.pdf')));

    expect(result.current.state).toStrictEqual({
      kind: 'success',
      fileId: 'file-2',
      fileName: 'resume.pdf',
    });
    expect(readStoredCvUpload()).toBe('{"fileId":"file-2","fileName":"resume.pdf"}');
  });

  it('uploads again after a failed attempt', async () => {
    storeRegistration();
    uploadCvMock
      .mockResolvedValueOnce({
        status: 'error',
        fileName: 'cv.pdf',
        message: 'Upload failed. Please try again.',
      })
      .mockResolvedValueOnce({ status: 'ok', fileId: 'file-1', fileName: 'resume.pdf' });
    const { result } = renderHook(() => useCvUpload());
    await act(() => result.current.selectFile(createCvFileFixture()));

    await act(() => result.current.selectFile(createCvFileFixture('resume.pdf')));

    expect(result.current.state).toStrictEqual({
      kind: 'success',
      fileId: 'file-1',
      fileName: 'resume.pdf',
    });
    expect(readStoredCvUpload()).toBe('{"fileId":"file-1","fileName":"resume.pdf"}');
  });

  it('drops the stored upload when a refused file replaces a successful one', async () => {
    storeRegistration();
    uploadCvMock.mockResolvedValueOnce({ status: 'ok', fileId: 'file-1', fileName: 'cv.pdf' });
    const { result } = renderHook(() => useCvUpload());
    await act(() => result.current.selectFile(createCvFileFixture()));

    await act(() => result.current.selectFile(createCvFileFixture('resume.txt')));

    expect(result.current.state).toStrictEqual({
      kind: 'error',
      fileName: 'resume.txt',
      message: 'Use a PDF, DOC or DOCX file.',
    });
    expect(readStoredCvUpload()).toBeNull();
  });

  it('ignores an upload that answers after the step was left', async () => {
    storeRegistration();
    const upload = deferUpload();
    const { result, unmount } = renderHook(() => useCvUpload());
    await act(async () => {
      void result.current.selectFile(createCvFileFixture());
    });

    unmount();
    await act(async () => {
      upload.resolve({ status: 'ok', fileId: 'file-1', fileName: 'cv.pdf' });
    });

    expect(readStoredCvUpload()).toBeNull();
  });

  it('ignores an upload that answers after the file was removed', async () => {
    storeRegistration();
    const upload = deferUpload();
    const { result } = renderHook(() => useCvUpload());
    await act(async () => {
      void result.current.selectFile(createCvFileFixture());
    });

    act(() => {
      result.current.remove();
    });
    await act(async () => {
      upload.resolve({ status: 'ok', fileId: 'file-1', fileName: 'cv.pdf' });
    });

    expect(result.current.state).toStrictEqual({ kind: 'empty' });
    expect(readStoredCvUpload()).toBeNull();
  });

  it('ignores the answer of an upload a newer selection replaced', async () => {
    storeRegistration();
    const replaced = deferUpload();
    deferUpload();
    const { result } = renderHook(() => useCvUpload());
    await act(async () => {
      void result.current.selectFile(createCvFileFixture());
    });
    await act(async () => {
      void result.current.selectFile(createCvFileFixture('resume.pdf'));
    });

    await act(async () => {
      replaced.resolve({ status: 'ok', fileId: 'file-1', fileName: 'cv.pdf' });
    });

    expect(result.current.state).toStrictEqual({ kind: 'uploading', fileName: 'resume.pdf' });
    expect(readStoredCvUpload()).toBeNull();
  });
});
