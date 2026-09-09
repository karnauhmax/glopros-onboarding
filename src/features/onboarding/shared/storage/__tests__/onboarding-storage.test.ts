import { onboardingStorage } from '../onboarding-storage';

const draft = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@',
  phone: { country: 'NL', number: '612345678' },
  termsAccepted: true,
} as const;

const draftJson =
  '{"firstName":"Ada","lastName":"Lovelace","email":"ada@","phone":{"country":"NL","number":"612345678"},"termsAccepted":true}';

describe('onboardingStorage', () => {
  beforeEach(() => {
    onboardingStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('writes the draft as JSON under the onboarding.draft key', () => {
    onboardingStorage.saveDraft(draft);

    expect(sessionStorage.getItem('onboarding.draft')).toBe(draftJson);
  });

  it('leaves a password out of the stored draft', () => {
    onboardingStorage.saveDraft({ ...draft, password: 'Password1' } as never);

    expect(sessionStorage.getItem('onboarding.draft')).toBe(draftJson);
  });

  it('reads every draft value back, including an email that is not valid yet', () => {
    onboardingStorage.saveDraft(draft);

    expect(onboardingStorage.readDraft()).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@',
      phone: { country: 'NL', number: '612345678' },
      termsAccepted: true,
    });
  });

  it('reads no draft when nothing was stored', () => {
    expect(onboardingStorage.readDraft()).toBeNull();
  });

  it('reads no draft when the stored value is not JSON', () => {
    sessionStorage.setItem('onboarding.draft', 'half written {');

    expect(onboardingStorage.readDraft()).toBeNull();
  });

  it('reads no draft when the stored JSON has another shape', () => {
    sessionStorage.setItem('onboarding.draft', '{"firstName":42}');

    expect(onboardingStorage.readDraft()).toBeNull();
  });

  it('does not throw when the browser refuses to store the draft', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('The quota has been exceeded.');
    });

    expect(() => onboardingStorage.saveDraft(draft)).not.toThrow();
  });

  it('keeps storing after the browser refused one write', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('The quota has been exceeded.');
    });

    onboardingStorage.saveDraft(draft);
    onboardingStorage.saveRegistration({ userId: 'user-1' });

    expect(onboardingStorage.readDraft()).toBeNull();
    expect(onboardingStorage.readRegistration()).toEqual({ userId: 'user-1' });
  });

  it('writes the registration as JSON under the onboarding.registration key', () => {
    onboardingStorage.saveRegistration({ userId: 'user-1' });

    expect(sessionStorage.getItem('onboarding.registration')).toBe('{"userId":"user-1"}');
  });

  it('reads the stored registration back', () => {
    onboardingStorage.saveRegistration({ userId: 'user-1' });

    expect(onboardingStorage.readRegistration()).toEqual({ userId: 'user-1' });
  });

  it('reads no registration when the stored JSON has another shape', () => {
    sessionStorage.setItem('onboarding.registration', '{"userId":7}');

    expect(onboardingStorage.readRegistration()).toBeNull();
  });

  it('writes the CV upload as JSON under the onboarding.cvUpload key', () => {
    onboardingStorage.saveCvUpload({ fileId: 'file-1', fileName: 'cv.pdf' });

    expect(sessionStorage.getItem('onboarding.cvUpload')).toBe(
      '{"fileId":"file-1","fileName":"cv.pdf"}',
    );
  });

  it('leaves the file size out of the stored CV upload', () => {
    onboardingStorage.saveCvUpload({ fileId: 'file-1', fileName: 'cv.pdf', size: 1024 } as never);

    expect(sessionStorage.getItem('onboarding.cvUpload')).toBe(
      '{"fileId":"file-1","fileName":"cv.pdf"}',
    );
  });

  it('reads the stored CV upload back', () => {
    onboardingStorage.saveCvUpload({ fileId: 'file-1', fileName: 'cv.pdf' });

    expect(onboardingStorage.readCvUpload()).toEqual({ fileId: 'file-1', fileName: 'cv.pdf' });
  });

  it('reads no CV upload when nothing was stored', () => {
    expect(onboardingStorage.readCvUpload()).toBeNull();
  });

  it('reads no CV upload when the stored value is not JSON', () => {
    sessionStorage.setItem('onboarding.cvUpload', 'half written {');

    expect(onboardingStorage.readCvUpload()).toBeNull();
  });

  it('reads no CV upload when the stored JSON has another shape', () => {
    sessionStorage.setItem('onboarding.cvUpload', '{"fileId":"file-1"}');

    expect(onboardingStorage.readCvUpload()).toBeNull();
  });

  it('removes the CV upload and leaves the draft and the registration stored', () => {
    onboardingStorage.saveDraft(draft);
    onboardingStorage.saveRegistration({ userId: 'user-1' });
    onboardingStorage.saveCvUpload({ fileId: 'file-1', fileName: 'cv.pdf' });

    onboardingStorage.clearCvUpload();

    expect(sessionStorage.getItem('onboarding.cvUpload')).toBeNull();
    expect(sessionStorage.getItem('onboarding.draft')).toBe(draftJson);
    expect(sessionStorage.getItem('onboarding.registration')).toBe('{"userId":"user-1"}');
  });

  it('reports the stored registration in the snapshot', () => {
    onboardingStorage.saveRegistration({ userId: 'user-1' });

    expect(onboardingStorage.getSnapshot()).toEqual({
      registration: { userId: 'user-1' },
      cvUpload: null,
    });
  });

  it('reports an empty storage as a snapshot without a registration', () => {
    expect(onboardingStorage.getSnapshot()).toEqual({ registration: null, cvUpload: null });
  });

  it('reports the stored CV upload in the snapshot', () => {
    onboardingStorage.saveRegistration({ userId: 'user-1' });
    onboardingStorage.saveCvUpload({ fileId: 'file-1', fileName: 'cv.pdf' });

    expect(onboardingStorage.getSnapshot()).toEqual({
      registration: { userId: 'user-1' },
      cvUpload: { fileId: 'file-1', fileName: 'cv.pdf' },
    });
  });

  it('does not throw when the browser refuses to remove what was stored', () => {
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Access to storage is denied.');
    });

    expect(() => onboardingStorage.clear()).not.toThrow();
  });

  it('removes the draft, the registration and the CV upload', () => {
    onboardingStorage.saveDraft(draft);
    onboardingStorage.saveRegistration({ userId: 'user-1' });
    onboardingStorage.saveCvUpload({ fileId: 'file-1', fileName: 'cv.pdf' });

    onboardingStorage.clear();

    expect(sessionStorage.getItem('onboarding.draft')).toBeNull();
    expect(sessionStorage.getItem('onboarding.registration')).toBeNull();
    expect(sessionStorage.getItem('onboarding.cvUpload')).toBeNull();
  });
});
