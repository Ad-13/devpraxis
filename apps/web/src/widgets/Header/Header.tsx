import { cookies } from 'next/headers';
import Link from 'next/link';

import { getSession } from '@/entities/session/api/getSession';
import { ACCENT_COOKIE, parseAccent } from '@/shared/config/theme';

import { ThemeSwitcher } from '@/features/ThemeSwitcher';
import { SessionRecovery } from '@/features/auth/ui';
import { logoutAction } from '@/features/auth/model/actions';

import styles from './Header.module.css';

export async function Header() {
  const [user, store] = await Promise.all([getSession(), cookies()]);
  const accent = parseAccent(store.get(ACCENT_COOKIE)?.value);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          DevPraxis
        </Link>

        <nav className={styles.nav} aria-label="Main">
          {user && (
            <div className={styles.links}>
              <Link href="/my" className={styles.link}>
                My articles
              </Link>
              <Link href="/favorites" className={styles.link}>
                Favorites
              </Link>
            </div>
          )}

          <ThemeSwitcher initial={accent} />

          {user ? (
            <>
              <Link href="/new" className={styles.cta}>
                New article
              </Link>
              <span className={styles.user}>{user.name}</span>
              <form action={logoutAction}>
                <button type="submit" className={styles.link}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <SessionRecovery />
              <Link href="/login" className={styles.link}>
                Sign in
              </Link>
              <Link href="/register" className={styles.cta}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
