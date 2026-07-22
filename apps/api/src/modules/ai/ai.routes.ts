import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { requireAuth } from '#middleware/requireAuth';
import { validateBody } from '#middleware/validateBody';
import * as controller from '#modules/ai/ai.controller';
import { chatSchema } from '#modules/ai/ai.schemas';
import { requireCsrf } from '#modules/auth/requireCsrf';

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { message: 'Too many AI requests, try later', code: 'RATE_LIMITED' } },
});

export const aiRoutes = Router();

aiRoutes.use(requireAuth, requireCsrf, aiLimiter);

aiRoutes.get('/models', controller.listModels);
aiRoutes.post('/articles/:id/summary', controller.summary);
aiRoutes.post('/articles/:id/questions', controller.questions);
aiRoutes.post('/articles/:id/translate', controller.translate);
aiRoutes.post('/chat', validateBody(chatSchema), controller.chat);
