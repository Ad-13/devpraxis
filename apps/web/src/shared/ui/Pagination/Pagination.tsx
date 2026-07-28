import Link from 'next/link';

import { buttonClass } from '@/shared/ui/Button';

import styles from './Pagination.module.css';

interface IProps {
  page: number;
  pages: number;
  buildHref: (page: number) => string;
  span?: number;
}

type Slot = number | 'gap';

function pageSlots(page: number, pages: number, span: number): Slot[] {
  const wanted = new Set<number>([1, pages]);

  for (let candidate = page - span; candidate <= page + span; candidate += 1) {
    if (candidate >= 1 && candidate <= pages) wanted.add(candidate);
  }

  const slots: Slot[] = [];
  let previous = 0;

  for (const current of [...wanted].sort((a, b) => a - b)) {
    if (previous !== 0 && current - previous > 1) slots.push('gap');
    slots.push(current);
    previous = current;
  }

  return slots;
}

export function Pagination({ page, pages, buildHref, span = 1 }: IProps) {
  if (pages <= 1) return null;

  const slots = pageSlots(page, pages, span);

  return (
    <nav className={styles.nav} aria-label="Pagination">
      {page > 1 && (
        <Link href={buildHref(page - 1)} className={buttonClass({ size: 'sm' })} rel="prev">
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
                className={buttonClass({
                  variant: slot === page ? 'primary' : 'ghost',
                  size: 'sm',
                  className: styles.page,
                })}
                aria-current={slot === page ? 'page' : undefined}
              >
                {slot}
              </Link>
            </li>
          ),
        )}
      </ul>

      {page < pages && (
        <Link href={buildHref(page + 1)} className={buttonClass({ size: 'sm' })} rel="next">
          Next →
        </Link>
      )}
    </nav>
  );
}
