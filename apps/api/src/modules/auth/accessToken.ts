import type { Request } from 'express';
import { errors, jwtVerify } from 'jose';

import { env } from '#config/env';
import { ACCESS_COOKIE } from '#modules/auth/cookies';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export type AccessTokenState =
  | { status: 'valid'; userId: string }
  | { status: 'expired' }
  | { status: 'absent' }
  | { status: 'invalid' };

function extractAccessToken(req: Request): string | null {
  const cookieToken: unknown = req.cookies[ACCESS_COOKIE];
  if (typeof cookieToken === 'string' && cookieToken.length > 0) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length);

  return null;
}

export async function readAccessToken(req: Request): Promise<AccessTokenState> {
  const token = extractAccessToken(req);
  if (!token) return { status: 'absent' };

  try {
    const { payload } = await jwtVerify(token, accessSecret);
    if (typeof payload.sub !== 'string') return { status: 'invalid' };
    return { status: 'valid', userId: payload.sub };
  } catch (error) {
    if (error instanceof errors.JWTExpired) return { status: 'expired' };
    return { status: 'invalid' };
  }
}

export async function resolveUserId(req: Request): Promise<string | null> {
  const state = await readAccessToken(req);
  return state.status === 'valid' ? state.userId : null;
}
