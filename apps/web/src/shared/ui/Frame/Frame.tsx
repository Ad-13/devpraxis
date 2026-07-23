import type { ElementType, ReactNode } from 'react';

import styles from './Frame.module.css';

interface IProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  interactive?: boolean;
}

export function Frame({ children, as: Tag = 'div', className, interactive = false }: IProps) {
  const classes = [styles.frame, interactive ? styles.interactive : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes}>
      <div className={styles.inner}>{children}</div>
    </Tag>
  );
}
