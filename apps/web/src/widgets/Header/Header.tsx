import { cookies } from 'next/headers';
import Link from 'next/link';

import { getSession } from '@/entities/session/api/getSession';
import { ACCENT_COOKIE, parseAccent } from '@/shared/config/theme';

import { ThemeSwitcher } from '@/features/ThemeSwitcher';
import { SessionRecovery } from '@/features/auth/ui';
import { logoutAction } from '@/features/auth/model/actions';
import { buttonClass } from '@/shared/ui/Button';
import { NavLink } from '@/shared/ui/NavLink';

import styles from './Header.module.css';

export async function Header() {
  const [session, store] = await Promise.all([getSession(), cookies()]);
  const { user, recoverable } = session;
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
              <NavLink href="/my" className={styles.link}>
                My articles
              </NavLink>
              <NavLink href="/favorites" className={styles.link}>
                Favorites
              </NavLink>
              <NavLink href="/topics" className={styles.link}>
                Topics
              </NavLink>
              <NavLink href="/coach" className={styles.link}>
                Coach
              </NavLink>
            </div>
          )}

          <ThemeSwitcher initial={accent} />

          {user ? (
            <>
              <NavLink href="/new" className={buttonClass({ variant: 'primary', size: 'sm' })}>
                New article
              </NavLink>
              <span className={styles.user}>{user.name}</span>
              <form action={logoutAction}>
                <button type="submit" className={styles.link}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              {recoverable && <SessionRecovery />}
              <Link href="/login" className={styles.link}>
                Sign in
              </Link>
              <Link href="/register" className={buttonClass({ variant: 'primary', size: 'sm' })}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
