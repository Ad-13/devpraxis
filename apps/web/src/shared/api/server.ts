import 'server-only';

import { AUTH_COOKIES, CSRF_HEADER } from '@devpraxis/shared';
import { cookies } from 'next/headers';

import { serverEnv } from '@/shared/config/env';

import { MUTATING_METHODS, performRequest, type ApiResult, type RequestOptions } from './fetcher';

export async function apiServer<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const store = await cookies();
  const headers: Record<string, string> = { ...options.headers };

  const forwarded = store.toString();
  if (forwarded) headers.Cookie = forwarded;

  if (MUTATING_METHODS.has(options.method ?? 'GET')) {
    const csrf = store.get(AUTH_COOKIES.csrf)?.value;
    if (csrf) headers[CSRF_HEADER] = csrf;

    headers.Origin = serverEnv.WEB_ORIGIN;
  }

  return performRequest<T>(`${serverEnv.API_INTERNAL_URL}${path}`, { ...options, headers });
}
