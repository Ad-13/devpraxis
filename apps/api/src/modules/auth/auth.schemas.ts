import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100), // because of bcrypt
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
