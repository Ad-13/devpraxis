'use client';

import { AUTH_COOKIES, CSRF_HEADER } from '@devpraxis/shared';

import { readCookie } from '@/shared/lib/browserCookies';

import { MUTATING_METHODS, performRequest, type ApiResult, type RequestOptions } from './fetcher';

export async function apiBrowser<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { ...options.headers };

  if (MUTATING_METHODS.has(options.method ?? 'GET')) {
    const csrf = readCookie(AUTH_COOKIES.csrf);
    if (csrf) headers[CSRF_HEADER] = csrf;
  }

  return performRequest<T>(path, { ...options, headers, credentials: 'same-origin' });
}
