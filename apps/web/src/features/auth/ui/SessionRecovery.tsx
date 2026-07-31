'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { apiBrowser } from '@/shared/api/client';
import { isApiClientError } from '@/shared/api/errors';

import styles from './SessionRecovery.module.css';

type Phase = 'working' | 'failed';

interface IProps {
  visible?: boolean;
  redirectOnFail?: string;
}

export function SessionRecovery({ visible = false, redirectOnFail }: IProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('working');

  const attempted = useRef(false);

  const attempt = useCallback(() => {
    if (attempted.current) return;
    attempted.current = true;
    setPhase('working');

    void apiBrowser('/api/auth/refresh', { method: 'POST' })
      .then(() => {
        router.refresh();
      })
      .catch((error: unknown) => {
        const status = isApiClientError(error) ? error.status : 0;

        if (status === 401 || status === 403) {
          if (redirectOnFail) router.replace(redirectOnFail);
          else setPhase('failed');
          return;
        }

        attempted.current = false;
        setPhase('failed');
      });
  }, [router, redirectOnFail]);

  useEffect(() => {
    attempt();
  }, [attempt]);

  if (!visible) return null;

  if (phase === 'failed') {
    return (
      <div className={styles.screen} role="alert">
        <p className={styles.text}>Could not reach the server.</p>
        <button type="button" className={styles.retry} onClick={attempt}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.screen} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <p className={styles.text}>Restoring your session…</p>
    </div>
  );
}
