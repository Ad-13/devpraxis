import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { env } from '#config/env';
import { openApiDocument } from '#docs/openapi';
import { errorHandler, notFound } from '#middleware/errorHandler';
import { aiRoutes } from '#modules/ai/ai.routes';
import { articleRoutes } from '#modules/articles/articles.routes';
import { authRoutes } from '#modules/auth/auth.routes';
import { topicRoutes } from '#modules/topics/topics.routes';

export const app = express();

if (env.TRUST_PROXY > 0) app.set('trust proxy', env.TRUST_PROXY);

app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ data: { status: 'ok', uptime: process.uptime() } });
});

if (env.ENABLE_DOCS) {
  const swaggerUi = await import('swagger-ui-express');

  app.get('/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });
  app.use('/docs', swaggerUi.default.serve, swaggerUi.default.setup(openApiDocument));
}

app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/articles', articleRoutes);

app.use(notFound);
app.use(errorHandler);
