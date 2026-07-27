import type { NextFunction, Request, Response } from 'express';

import { resolveUserId } from '#modules/auth/accessToken';

export async function attachUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const userId = await resolveUserId(req);

  if (userId) req.user = { id: userId };

  next();
}
