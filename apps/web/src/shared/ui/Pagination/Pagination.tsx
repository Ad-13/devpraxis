import Link from 'next/link';

import { pageSlots } from './helper';
import styles from './Pagination.module.css';

interface IProps {
  page: number;
  pages: number;
  buildHref: (page: number) => string;
  span?: number;
}

export function Pagination({ page, pages, buildHref, span = 1 }: IProps) {
  if (pages <= 1) return null;

  const slots = pageSlots(page, pages, span);

  return (
    <nav className={styles.nav} aria-label="Pagination">
      {page > 1 && (
        <Link href={buildHref(page - 1)} className={styles.step} rel="prev">
          ← Prev
        </Link>
      )}

      <ul className={styles.list}>
        {slots.map((slot, index) =>
          slot === 'gap' ? (
            <li key={`gap-${index}`} className={styles.gap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={slot}>
              <Link
                href={buildHref(slot)}
                className={slot === page ? `${styles.page} ${styles.current}` : styles.page}
                aria-current={slot === page ? 'page' : undefined}
              >
                {slot}
              </Link>
            </li>
          ),
        )}
      </ul>

      {page < pages && (
        <Link href={buildHref(page + 1)} className={styles.step} rel="next">
          Next →
        </Link>
      )}
    </nav>
  );
}
