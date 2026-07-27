import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '#utils/ApiError';
import { resolveUserId } from '#modules/auth/accessToken';

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const userId = await resolveUserId(req);

  if (!userId) throw ApiError.unauthorized('Missing or invalid access token');

  req.user = { id: userId };
  next();
}
