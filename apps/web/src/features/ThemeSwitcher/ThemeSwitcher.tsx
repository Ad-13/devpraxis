'use client';

import { useEffect, useState } from 'react';

import {
  ACCENTS,
  ACCENT_COOKIE,
  ACCENT_COOKIE_MAX_AGE,
  ACCENT_LABELS,
  DEFAULT_ACCENT,
  type Accent,
} from '@/shared/config/theme';
import { writeCookie } from '@/shared/lib/browserCookies';

import styles from './ThemeSwitcher.module.css';

interface IProps {
  initial: Accent;
}

export function ThemeSwitcher({ initial }: IProps) {
  const [accent, setAccent] = useState<Accent>(initial);

  useEffect(() => {
    const root = document.documentElement;

    if (accent === DEFAULT_ACCENT) {
      root.removeAttribute('data-accent');
    } else {
      root.dataset.accent = accent;
    }

    writeCookie(ACCENT_COOKIE, accent, ACCENT_COOKIE_MAX_AGE);
  }, [accent]);

  return (
    <div className={styles.group} role="group" aria-label="Accent colour">
      {ACCENTS.map((option) => (
        <button
          key={option}
          type="button"
          className={styles.swatch}
          data-accent-option={option}
          aria-pressed={option === accent}
          aria-label={ACCENT_LABELS[option]}
          title={ACCENT_LABELS[option]}
          onClick={() => setAccent(option)}
        />
      ))}
    </div>
  );
}
