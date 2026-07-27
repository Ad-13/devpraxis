import 'server-only';

import { z } from 'zod';

const serverEnvSchema = z.object({
  API_INTERNAL_URL: z.url().default('http://localhost:3000'),
  WEB_ORIGIN: z.url().default('http://localhost:3001'),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid server environment:\n${z.prettifyError(parsed.error)}`);
}

export const serverEnv = parsed.data;
