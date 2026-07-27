import type { Request } from 'express';
import { jwtVerify } from 'jose';

import { env } from '#config/env';
import { ACCESS_COOKIE } from '#modules/auth/cookies';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export function extractAccessToken(req: Request): string | null {
  const cookieToken: unknown = req.cookies[ACCESS_COOKIE];
  if (typeof cookieToken === 'string' && cookieToken.length > 0) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length);

  return null;
}

export async function resolveUserId(req: Request): Promise<string | null> {
  const token = extractAccessToken(req);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, accessSecret);
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}