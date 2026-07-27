import type { Request, Response } from 'express';

import { ApiError } from '#utils/ApiError';
import * as authService from '#modules/auth/auth.service';
import { UserModel } from '#modules/users/user.model';
import { currentUserId } from '#utils/currentUserId';

import type { LoginDto, RegisterDto } from '@devpraxis/shared';
import {
  clearAuthCookies,
  generateCsrfToken,
  REFRESH_COOKIE,
  setAuthCookies,
} from '#modules/auth/cookies';

export async function register(
  req: Request<unknown, unknown, RegisterDto>,
  res: Response,
): Promise<void> {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  setAuthCookies(res, { accessToken, refreshToken, csrfToken: generateCsrfToken() });
  res.status(201).json({ data: { user, accessToken } });
}

export async function login(
  req: Request<unknown, unknown, LoginDto>,
  res: Response,
): Promise<void> {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  setAuthCookies(res, { accessToken, refreshToken, csrfToken: generateCsrfToken() });
  res.json({ data: { user, accessToken } });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await UserModel.findById(currentUserId(req));

  if (!user) throw ApiError.unauthorized('User no longer exists');

  res.json({ data: { user } });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const rawToken: unknown = req.cookies[REFRESH_COOKIE];

  if (typeof rawToken !== 'string' || rawToken.length === 0) {
    throw ApiError.unauthorized('Refresh token cookie is missing');
  }

  const { accessToken, refreshToken } = await authService.refresh(rawToken);

  setAuthCookies(res, { accessToken, refreshToken, csrfToken: generateCsrfToken() });
  res.json({ data: { accessToken } });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const rawToken: unknown = req.cookies[REFRESH_COOKIE];

  await authService.logout(typeof rawToken === 'string' ? rawToken : undefined);

  clearAuthCookies(res);
  res.status(204).end();
}
