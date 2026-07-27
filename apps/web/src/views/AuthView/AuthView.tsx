import Link from 'next/link';
import type { ReactNode } from 'react';

import { Frame } from '@/shared/ui/Frame';

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
      <Frame className={styles.panel}>
        <div className={styles.inner}>
          <p className="label">DevPraxis</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>

          {children}

          <p className={styles.footer}>
            {footer.question} <Link href={footer.href}>{footer.action}</Link>
          </p>
        </div>
      </Frame>
    </main>
  );
}
