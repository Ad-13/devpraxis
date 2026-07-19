import { z } from 'zod';

import { AI_MODEL_IDS } from '#config/aiModels';
import { LANGUAGES } from '#modules/articles/article.model';

const modelField = z.enum(AI_MODEL_IDS).optional();

export const summarySchema = z.object({ model: modelField });

export const questionsSchema = z.object({
  model: modelField,
  count: z.coerce.number().int().min(3).max(10).default(5),
});

export const translateSchema = z.object({
  model: modelField,
  targetLang: z.enum(LANGUAGES),
});

export const chatSchema = z.object({
  model: modelField,
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
});

export type ChatDto = z.infer<typeof chatSchema>;
