import { z } from 'zod';

import type { Country } from '@/features/onboarding/api';

const countrySchema = z.enum(['NL', 'PL', 'UA'] as const satisfies readonly Country[]);

export const draftSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.object({ country: countrySchema, number: z.string() }),
  termsAccepted: z.boolean(),
});

export const registrationSchema = z.object({ userId: z.string() });

export const cvUploadSchema = z.object({ fileId: z.string(), fileName: z.string() });

export type Draft = z.infer<typeof draftSchema>;
export type Registration = z.infer<typeof registrationSchema>;
export type CvUpload = z.infer<typeof cvUploadSchema>;
