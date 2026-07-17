import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { errorHandler, notFound } from '#middleware/errorHandler';
import { authRoutes } from '#modules/auth/auth.routes';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ data: { status: 'ok', uptime: process.uptime() } });
});

app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);
