export const createCvFileFixture = (name = 'cv.pdf'): File =>
  new File(['cv'], name, { type: 'application/pdf' });
