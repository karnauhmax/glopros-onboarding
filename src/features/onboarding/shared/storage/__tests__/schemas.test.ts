import { cvUploadSchema, draftSchema, registrationSchema } from '../schemas';

const draft = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: { country: 'NL', number: '612345678' },
  termsAccepted: true,
};

describe('draftSchema', () => {
  it('accepts a Polish phone country', () => {
    const result = draftSchema.safeParse({
      ...draft,
      phone: { country: 'PL', number: '512345678' },
    });

    expect(result.success).toBe(true);
  });

  it('accepts a Ukrainian phone country', () => {
    const result = draftSchema.safeParse({
      ...draft,
      phone: { country: 'UA', number: '501234567' },
    });

    expect(result.success).toBe(true);
  });

  it('rejects a country the flow does not offer', () => {
    const result = draftSchema.safeParse({
      ...draft,
      phone: { country: 'DE', number: '612345678' },
    });

    expect(result.success).toBe(false);
  });

  it('rejects a draft without the terms flag', () => {
    const result = draftSchema.safeParse({ ...draft, termsAccepted: undefined });

    expect(result.success).toBe(false);
  });
});

describe('registrationSchema', () => {
  it('accepts a registration with a user id', () => {
    const result = registrationSchema.safeParse({ userId: 'user-1' });

    expect(result.success).toBe(true);
  });

  it('rejects a registration whose user id is not a string', () => {
    const result = registrationSchema.safeParse({ userId: 7 });

    expect(result.success).toBe(false);
  });
});

describe('cvUploadSchema', () => {
  it('drops keys that are not part of a CV upload', () => {
    const parsed = cvUploadSchema.parse({ fileId: 'file-1', fileName: 'cv.pdf', size: 1024 });

    expect(parsed).toEqual({ fileId: 'file-1', fileName: 'cv.pdf' });
  });

  it('accepts a CV upload with a file id and a file name', () => {
    const result = cvUploadSchema.safeParse({ fileId: 'file-1', fileName: 'cv.pdf' });

    expect(result.success).toBe(true);
  });

  it('rejects a CV upload without a file name', () => {
    const result = cvUploadSchema.safeParse({ fileId: 'file-1' });

    expect(result.success).toBe(false);
  });

  it('rejects a CV upload whose file id is not a string', () => {
    const result = cvUploadSchema.safeParse({ fileId: 7, fileName: 'cv.pdf' });

    expect(result.success).toBe(false);
  });
});
