import type { NextFunction, Request, Response } from 'express';
import { ZodError, z } from 'zod';

import { env } from '#config/env';
import { ApiError } from '#utils/ApiError';
import { isDuplicateKey, isMongooseCastError } from '#utils/mongo';

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.method} ${req.path} not found`));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      error: { message: err.message, code: err.code, details: err.details },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: z.treeifyError(err),
      },
    });
    return;
  }

  if (isMongooseCastError(err)) {
    res.status(400).json({
      error: {
        message: `Invalid value for "${err.path}"`,
        code: 'INVALID_ID',
        details: { path: err.path, value: err.value },
      },
    });
    return;
  }

  if (isDuplicateKey(err)) {
    res.status(409).json({
      error: {
        message: 'Resource with these unique fields already exists',
        code: 'DUPLICATE_KEY',
        details: { keys: err.keyValue },
      },
    });
    return;
  }

  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    error: {
      message: env.NODE_ENV === 'production' ? 'Internal server error' : String(err),
      code: 'INTERNAL',
    },
  });
}
