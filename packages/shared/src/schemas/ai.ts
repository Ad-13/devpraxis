import { z } from 'zod';

import { AI_LIMITS, AI_MODEL_IDS } from '../domain/ai.ts';
import { LANGUAGES } from '../domain/language.ts';

const modelField = z.enum(AI_MODEL_IDS).optional();

export const summarySchema = z.object({ model: modelField });

export const questionsSchema = z.object({
  model: modelField,
  count: z.coerce
    .number()
    .int()
    .min(AI_LIMITS.questionsMin)
    .max(AI_LIMITS.questionsMax)
    .default(AI_LIMITS.questionsDefault),
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
        content: z.string().min(1).max(AI_LIMITS.chatMessageLength),
      }),
    )
    .min(1)
    .max(AI_LIMITS.chatMessagesMax),
});

export type ChatDto = z.infer<typeof chatSchema>;
export type ChatMessage = ChatDto['messages'][number];
