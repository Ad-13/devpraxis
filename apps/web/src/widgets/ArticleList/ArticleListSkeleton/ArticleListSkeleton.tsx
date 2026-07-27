import { Frame } from '@/shared/ui/Frame';

import styles from './ArticleListSkeleton.module.css';

interface IProps {
  count?: number;
}

export function ArticleListSkeleton({ count = 10 }: IProps) {
  return (
    <ul className={styles.grid} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <Frame className={styles.card}>
            <div className={styles.body}>
              <span className={`${styles.bar} ${styles.meta}`} />
              <span className={`${styles.bar} ${styles.title}`} />
              <span className={`${styles.bar} ${styles.titleShort}`} />
              <span className={`${styles.bar} ${styles.tag}`} />
            </div>
          </Frame>
        </li>
      ))}
    </ul>
  );
}
