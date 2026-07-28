'use client';

import { AUTH_COOKIES } from '@devpraxis/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { apiBrowser } from '@/shared/api/client';
import { isApiClientError } from '@/shared/api/errors';
import { deleteCookie, readCookie } from '@/shared/lib/browserCookies';

export function SessionRecovery() {
  const router = useRouter();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    if (!readCookie(AUTH_COOKIES.csrf)) return;

    void apiBrowser('/api/auth/refresh', { method: 'POST' })
      .then(() => {
        router.refresh();
      })
      .catch((error: unknown) => {
        const status = isApiClientError(error) ? error.status : 0;

        if (status === 401 || status === 403) {
          deleteCookie(AUTH_COOKIES.csrf);
          return;
        }

        attempted.current = false;
      });
  }, [router]);

  return null;
}
