import type { CookieOptions, Request, Response } from 'express';

import { env } from '#config/env';
import { ApiError } from '#utils/ApiError';
import * as authService from '#modules/auth/auth.service';

import type { LoginDto, RegisterDto } from '#modules/auth/auth.schemas';

const REFRESH_COOKIE = 'refreshToken';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth',
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
};

export async function register(
  req: Request<unknown, unknown, RegisterDto>,
  res: Response,
): Promise<void> {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  res.status(201).json({ data: { user, accessToken } });
}

export async function login(
  req: Request<unknown, unknown, LoginDto>,
  res: Response,
): Promise<void> {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  res.json({ data: { user, accessToken } });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const rawToken: unknown = req.cookies[REFRESH_COOKIE];

  if (typeof rawToken !== 'string' || rawToken.length === 0) {
    throw ApiError.unauthorized('Refresh token cookie is missing');
  }

  const { accessToken, refreshToken } = await authService.refresh(rawToken);

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  res.json({ data: { accessToken } });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const rawToken: unknown = req.cookies[REFRESH_COOKIE];

  await authService.logout(typeof rawToken === 'string' ? rawToken : undefined);

  res.clearCookie(REFRESH_COOKIE, { path: refreshCookieOptions.path });
  res.status(204).end();
}
