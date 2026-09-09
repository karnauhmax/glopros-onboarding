import {
  canVisit,
  getFirstUnfinishedStep,
  getNextStep,
  getPreviousStep,
  getStepByPath,
  getStepIndex,
  steps,
} from '../steps';

const emptyStorage = { registration: null, cvUpload: null };
const afterSignUp = { registration: { userId: 'user-1' }, cvUpload: null };
const afterCvUpload = {
  registration: { userId: 'user-1' },
  cvUpload: { fileId: 'file-1', fileName: 'cv.pdf' },
};

describe('steps', () => {
  it('lists the three steps in flow order', () => {
    expect(steps.map((step) => step.id)).toEqual(['sign-up', 'cv-upload', 'success']);
  });

  it('gives every step its route under /onboarding', () => {
    expect(steps.map((step) => step.path)).toEqual([
      '/onboarding/sign-up',
      '/onboarding/cv-upload',
      '/onboarding/success',
    ]);
  });

  it('counts sign-up as completed once a registration is stored', () => {
    expect(steps[0].isCompleted(afterSignUp)).toBe(true);
  });

  it('leaves sign-up unfinished while there is no registration', () => {
    expect(steps[0].isCompleted(emptyStorage)).toBe(false);
  });

  it('counts the CV upload as completed once an upload is stored', () => {
    expect(steps[1].isCompleted(afterCvUpload)).toBe(true);
  });

  it('leaves the CV upload unfinished while nothing was uploaded', () => {
    expect(steps[1].isCompleted(afterSignUp)).toBe(false);
  });

  it('never counts the success step as completed', () => {
    expect(steps[2].isCompleted(afterCvUpload)).toBe(false);
  });
});

describe('getStepByPath', () => {
  it('finds the step of a flow route', () => {
    expect(getStepByPath('/onboarding/cv-upload')?.id).toBe('cv-upload');
  });

  it('finds no step for a route outside the flow', () => {
    expect(getStepByPath('/profile')).toBeUndefined();
  });
});

describe('getStepIndex', () => {
  it('numbers the steps from zero in flow order', () => {
    expect(getStepIndex('sign-up')).toBe(0);
    expect(getStepIndex('cv-upload')).toBe(1);
    expect(getStepIndex('success')).toBe(2);
  });
});

describe('getNextStep', () => {
  it('follows the flow order', () => {
    expect(getNextStep('sign-up')?.id).toBe('cv-upload');
  });

  it('has nothing after the last step', () => {
    expect(getNextStep('success')).toBeUndefined();
  });
});

describe('getPreviousStep', () => {
  it('walks the flow order backwards', () => {
    expect(getPreviousStep('cv-upload')?.id).toBe('sign-up');
  });

  it('has nothing before the first step', () => {
    expect(getPreviousStep('sign-up')).toBeUndefined();
  });
});

describe('getFirstUnfinishedStep', () => {
  it('starts a visitor without a registration at sign-up', () => {
    expect(getFirstUnfinishedStep(emptyStorage).id).toBe('sign-up');
  });

  it('moves a registered visitor on to the CV upload', () => {
    expect(getFirstUnfinishedStep(afterSignUp).id).toBe('cv-upload');
  });

  it('leaves a visitor who uploaded a CV at the success step', () => {
    expect(getFirstUnfinishedStep(afterCvUpload).id).toBe('success');
  });
});

describe('canVisit', () => {
  it('opens the first step to everyone', () => {
    expect(canVisit(steps[0], emptyStorage)).toBe(true);
  });

  it('closes a step beyond the first unfinished one', () => {
    expect(canVisit(steps[2], emptyStorage)).toBe(false);
  });

  it('opens the step that follows a completed one', () => {
    expect(canVisit(steps[1], afterSignUp)).toBe(true);
  });

  it('keeps a completed step open', () => {
    expect(canVisit(steps[0], afterSignUp)).toBe(true);
  });

  it('closes the success step while the CV upload is unfinished', () => {
    expect(canVisit(steps[2], afterSignUp)).toBe(false);
  });

  it('opens the success step once a CV is uploaded', () => {
    expect(canVisit(steps[2], afterCvUpload)).toBe(true);
  });
});
