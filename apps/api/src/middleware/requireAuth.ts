import type { NextFunction, Request, Response } from 'express';
import { jwtVerify } from 'jose';

import { env } from '#config/env';
import { ApiError } from '#utils/ApiError';
import { ACCESS_COOKIE } from '#modules/auth/cookies';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const cookieToken: unknown = req.cookies[ACCESS_COOKIE];
  const header = req.headers.authorization;

  const token =
    typeof cookieToken === 'string' && cookieToken.length > 0
      ? cookieToken
      : header?.startsWith('Bearer ')
        ? header.slice('Bearer '.length)
        : null;

  if (!token) {
    throw ApiError.unauthorized('Missing access token');
  }

  try {
    const { payload } = await jwtVerify(token, accessSecret);
    if (typeof payload.sub !== 'string') throw new Error('sub claim missing');
    req.user = { id: payload.sub };
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  next();
}

