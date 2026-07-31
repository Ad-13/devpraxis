import { randomBytes } from 'node:crypto';

import type { Response } from 'express';

import { env } from '#config/env';

import { AUTH_COOKIES } from '@devpraxis/shared';

export const ACCESS_COOKIE = AUTH_COOKIES.access;
export const REFRESH_COOKIE = AUTH_COOKIES.refresh;
export const CSRF_COOKIE = AUTH_COOKIES.csrf;

const isProd = env.NODE_ENV === 'production';
const base = { secure: isProd, sameSite: 'lax' as const };

export function generateCsrfToken(): string {
  return randomBytes(32).toString('base64url');
}

const refreshMaxAge = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string; csrfToken: string },
): void {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    httpOnly: true,
    path: '/',
    maxAge: refreshMaxAge,
  });

  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...base,
    httpOnly: true,
    path: '/api/auth',
    maxAge: refreshMaxAge,
  });

  res.cookie(CSRF_COOKIE, tokens.csrfToken, {
    ...base,
    httpOnly: false,
    path: '/',
    maxAge: refreshMaxAge,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.clearCookie(CSRF_COOKIE, { path: '/' });
}
