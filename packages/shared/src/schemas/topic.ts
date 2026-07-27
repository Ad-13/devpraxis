import { z } from 'zod';

import { TOPIC_LIMITS } from '../domain/topic.ts';

export const createTopicSchema = z.object({
  name: z.string().trim().min(TOPIC_LIMITS.nameMin).max(TOPIC_LIMITS.nameMax),
});

export type CreateTopicDto = z.infer<typeof createTopicSchema>;
