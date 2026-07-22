import { timingSafeEqual } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

import { env } from '#config/env';
import { ApiError } from '#utils/ApiError';
import { CSRF_COOKIE } from '#modules/auth/cookies';

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function requireCsrf(req: Request, _res: Response, next: NextFunction): void {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    next();
    return;
  }

  const origin = req.headers.origin;
  if (origin !== undefined && origin !== env.WEB_ORIGIN) {
    throw ApiError.forbidden('Origin not allowed');
  }

  const cookieToken: unknown = req.cookies[CSRF_COOKIE];
  const headerToken = req.headers['x-csrf-token'];

  if (
    typeof cookieToken !== 'string' ||
    typeof headerToken !== 'string' ||
    !safeEqual(cookieToken, headerToken)
  ) {
    throw ApiError.forbidden('CSRF token missing or invalid');
  }

  next();
}
