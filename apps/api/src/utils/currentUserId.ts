import type { Request } from 'express';
import { ApiError } from '#utils/ApiError';

export function currentUserId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}
