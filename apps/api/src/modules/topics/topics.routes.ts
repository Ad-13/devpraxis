import { Router, type Request } from 'express';
import { z } from 'zod';

import { requireAuth } from '#middleware/requireAuth';
import { validateBody } from '#middleware/validateBody';
import * as topicsService from '#modules/topics/topics.service';
import { idParamSchema } from '#modules/articles/article.schemas';
import { validateParams } from '#middleware/validateParams';

export const createTopicSchema = z.object({ name: z.string().trim().min(2).max(50) });

export const topicRoutes = Router();

topicRoutes.get('/', async (_req, res) => {
  res.json({ data: await topicsService.listTopics() });
});

topicRoutes.post('/', requireAuth, validateBody(createTopicSchema), async (req, res) => {
  res.status(201).json({ data: await topicsService.createTopic(req.body.name) });
});

topicRoutes.delete('/:id', requireAuth, validateParams(idParamSchema), async (req: Request<{ id: string }>, res) => {
  await topicsService.deleteTopic(req.params.id);
  res.status(204).end();
});
