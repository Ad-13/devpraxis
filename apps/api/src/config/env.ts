import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  PORT: z.coerce.number().int().positive().default(3000),

  MONGO_URI: z
    .string()
    .min(1, 'MONGO_URI is required')
    .refine((v) => v.startsWith('mongodb://') || v.startsWith('mongodb+srv://'), {
      message: 'MONGO_URI must be a mongodb:// or mongodb+srv:// connection string',
    }),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),

  ACCESS_TOKEN_TTL: z.string().default('15m'),

  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:\n', z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
