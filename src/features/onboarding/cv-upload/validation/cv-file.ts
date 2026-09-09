const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'] as const;

const MAX_FILE_SIZE_MB = 10;

const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const FORMATS = ALLOWED_EXTENSIONS.map((extension) => extension.toUpperCase());

const FORMAT_LIST = `${FORMATS.slice(0, -1).join(', ')} or ${FORMATS[FORMATS.length - 1]}`;

const CV_FILE_MESSAGES = {
  format: `Use a ${FORMAT_LIST} file.`,
  size: `This file is larger than ${MAX_FILE_SIZE_MB} MB.`,
  empty: 'This file is empty.',
} as const;

export const CV_FILE_ACCEPT = ALLOWED_EXTENSIONS.map((extension) => `.${extension}`).join(',');

export const CV_FILE_HINT = `${FORMAT_LIST} up to ${MAX_FILE_SIZE_MB} MB`;

function getExtension(fileName: string): string | null {
  const lastDotIndex = fileName.lastIndexOf('.');

  if (lastDotIndex <= 0) {
    return null;
  }

  return fileName.slice(lastDotIndex + 1).toLowerCase();
}

export function validateCvFile(file: File): string | null {
  const extension = getExtension(file.name);

  if (extension === null || !(ALLOWED_EXTENSIONS as readonly string[]).includes(extension)) {
    return CV_FILE_MESSAGES.format;
  }

  if (file.size === 0) {
    return CV_FILE_MESSAGES.empty;
  }

  if (file.size > MAX_FILE_SIZE) {
    return CV_FILE_MESSAGES.size;
  }

  return null;
}
