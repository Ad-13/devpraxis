import Link from 'next/link';
import type { ReactNode } from 'react';

import styles from './AuthView.module.css';

interface IProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: { question: string; href: string; action: string };
}

export function AuthView({ title, subtitle, children, footer }: IProps) {
  return (
    <main className={styles.screen}>
      <div className={styles.panel}>
        <div className={styles.bar}>
          <span className={styles.barLabel}>Secure terminal</span>
          <span className={styles.barDot} aria-hidden="true" />
        </div>

        <div className={styles.inner}>
          <p className={styles.boot}>
            <span className={styles.typed}>&gt; devpraxis --auth</span>
          </p>

          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>

          {children}

          <p className={styles.footer}>
            {footer.question} <Link href={footer.href}>{footer.action}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
