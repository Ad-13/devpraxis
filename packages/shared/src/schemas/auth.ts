import { z } from 'zod';

import { AUTH_LIMITS } from '../domain/auth.ts';

export const registerSchema = z.object({
  name: z.string().trim().min(AUTH_LIMITS.nameMin).max(AUTH_LIMITS.nameMax),
  email: z.email().toLowerCase(),
  password: z.string().min(AUTH_LIMITS.passwordMin).max(AUTH_LIMITS.passwordMax),
});

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
