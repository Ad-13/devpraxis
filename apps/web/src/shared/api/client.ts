'use client';

import { AUTH_COOKIES, CSRF_HEADER } from '@devpraxis/shared';

import { MUTATING_METHODS, performRequest, type ApiResult, type RequestOptions } from './fetcher';

function readCookie(name: string): string | undefined {
  const prefix = `${encodeURIComponent(name)}=`;
  const match = document.cookie.split('; ').find((entry) => entry.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : undefined;
}

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
