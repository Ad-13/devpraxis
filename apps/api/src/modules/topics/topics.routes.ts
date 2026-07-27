import { Router, type Request } from 'express';

import { requireAuth } from '#middleware/requireAuth';
import { validateBody } from '#middleware/validateBody';
import { validateParams } from '#middleware/validateParams';
import * as topicsService from '#modules/topics/topics.service';
import { requireCsrf } from '#modules/auth/requireCsrf';
import { createTopicSchema, idParamSchema } from '@devpraxis/shared';

export const topicRoutes = Router();

topicRoutes.get('/', async (_req, res) => {
  res.json({ data: await topicsService.listTopics() });
});

topicRoutes.post(
  '/',
  requireAuth,
  requireCsrf,
  validateBody(createTopicSchema),
  async (req: Request<unknown, unknown, { name: string }>, res) => {
    res.status(201).json({ data: await topicsService.createTopic(req.body.name) });
  },
);

topicRoutes.delete(
  '/:id',
  requireAuth,
  requireCsrf,
  validateParams(idParamSchema),
  async (req: Request<{ id: string }>, res) => {
    await topicsService.deleteTopic(req.params.id);
    res.status(204).end();
  },
);
