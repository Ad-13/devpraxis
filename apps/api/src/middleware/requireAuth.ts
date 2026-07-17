import type { NextFunction, Request, Response } from 'express';
import { jwtVerify } from 'jose';

import { env } from '#config/env';
import { ApiError } from '#utils/ApiError';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing Bearer token');
  }

  const token = header.slice('Bearer '.length);

  try {
    const { payload } = await jwtVerify(token, accessSecret);

    if (typeof payload.sub !== 'string') {
      throw new Error('sub claim missing');
    }

    req.user = { id: payload.sub };
  } catch {
    throw ApiError.unauthorized('Error with token');
  }

  next();
}
