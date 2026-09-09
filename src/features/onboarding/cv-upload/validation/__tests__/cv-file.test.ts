import { CV_FILE_ACCEPT, CV_FILE_HINT, validateCvFile } from '../cv-file';

function createCvFile(name: string, size: number): File {
  const file = new File(['cv'], name, { type: 'application/pdf' });

  Object.defineProperty(file, 'size', { value: size });

  return file;
}

describe('CV_FILE_ACCEPT', () => {
  it('offers the picker the three allowed extensions', () => {
    expect(CV_FILE_ACCEPT).toBe('.pdf,.doc,.docx');
  });
});

describe('CV_FILE_HINT', () => {
  it('states the formats and the size limit', () => {
    expect(CV_FILE_HINT).toBe('PDF, DOC or DOCX up to 10 MB');
  });
});

describe('validateCvFile', () => {
  it('accepts a lower case pdf file', () => {
    const file = new File(['cv'], 'cv.pdf', { type: 'application/pdf' });

    const message = validateCvFile(file);

    expect(message).toBeNull();
  });

  it('accepts an upper case PDF extension', () => {
    const file = new File(['cv'], 'CV.PDF', { type: 'application/pdf' });

    const message = validateCvFile(file);

    expect(message).toBeNull();
  });

  it('accepts an upper case DOC extension', () => {
    const file = new File(['cv'], 'cv.DOC', { type: 'application/pdf' });

    const message = validateCvFile(file);

    expect(message).toBeNull();
  });

  it('accepts a docx file', () => {
    const file = new File(['cv'], 'cv.docx', { type: 'application/pdf' });

    const message = validateCvFile(file);

    expect(message).toBeNull();
  });

  it('rejects a file with an unsupported extension', () => {
    const file = new File(['cv'], 'cv.txt', { type: 'application/pdf' });

    const message = validateCvFile(file);

    expect(message).toBe('Use a PDF, DOC or DOCX file.');
  });

  it('rejects a file with no extension', () => {
    const file = new File(['cv'], 'cv', { type: 'application/pdf' });

    const message = validateCvFile(file);

    expect(message).toBe('Use a PDF, DOC or DOCX file.');
  });

  it('rejects a file name that is only a dot and an extension', () => {
    const file = new File(['cv'], '.pdf', { type: 'application/pdf' });

    const message = validateCvFile(file);

    expect(message).toBe('Use a PDF, DOC or DOCX file.');
  });

  it('rejects a file with a trailing exe extension after the real one', () => {
    const file = new File(['cv'], 'cv.pdf.exe', { type: 'application/pdf' });

    const message = validateCvFile(file);

    expect(message).toBe('Use a PDF, DOC or DOCX file.');
  });

  it('rejects an empty pdf file', () => {
    const file = createCvFile('cv.pdf', 0);

    const message = validateCvFile(file);

    expect(message).toBe('This file is empty.');
  });

  it('rejects an empty file with an unsupported extension as a format error, not an empty error', () => {
    const file = createCvFile('cv.txt', 0);

    const message = validateCvFile(file);

    expect(message).toBe('Use a PDF, DOC or DOCX file.');
  });

  it('accepts a file one byte under the size limit', () => {
    const file = createCvFile('cv.pdf', 10485759);

    const message = validateCvFile(file);

    expect(message).toBeNull();
  });

  it('accepts a file of exactly 10 MB', () => {
    const file = createCvFile('cv.pdf', 10485760);

    const message = validateCvFile(file);

    expect(message).toBeNull();
  });

  it('rejects a file one byte over 10 MB', () => {
    const file = createCvFile('cv.pdf', 10485761);

    const message = validateCvFile(file);

    expect(message).toBe('This file is larger than 10 MB.');
  });
});
