export type Country = 'NL' | 'PL' | 'UA';

export type RegistrationRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: { country: Country; number: string };
  password: string;
  termsAccepted: true;
};

export type RegistrationResponse =
  | { status: 'ok'; userId: string }
  | {
      status: 'error';
      fieldErrors?: Partial<Record<'email' | 'phone' | 'password', string>>;
      message?: string;
    };

export type CvUploadRequest = { userId: string; file: File };

export type CvUploadResponse =
  | { status: 'ok'; fileId: string; fileName: string }
  | { status: 'error'; fileName: string; message: string };

export interface OnboardingService {
  register(request: RegistrationRequest): Promise<RegistrationResponse>;
  uploadCv(request: CvUploadRequest): Promise<CvUploadResponse>;
}
