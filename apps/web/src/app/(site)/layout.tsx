import type { ReactNode } from 'react';

import { Footer } from '@/widgets/Footer';
import { Header } from '@/widgets/Header';
import { NavProgress } from '@/shared/ui/NavProgress';

import styles from './layout.module.css';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.content}>{children}</div>
      <Footer />
      <NavProgress />
    </div>
  );
}
