'use client';

import { useSyncExternalStore } from 'react';

import { getServerSnapshot, getSnapshot, subscribe } from './navProgressStore';

import styles from './NavProgress.module.css';

export function NavProgress() {
  const active = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!active) return null;

  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className="visually-hidden">Loading page</span>

      <span className={styles.rig} aria-hidden="true">
        <span className={`${styles.ring} ${styles.outer}`} />
        <span className={`${styles.ring} ${styles.middle}`} />
        <span className={`${styles.ring} ${styles.inner}`} />
        <span className={styles.core} />
      </span>
    </div>
  );
}
