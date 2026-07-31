import type { Metadata } from 'next';

import { Protected } from '@/features/auth/ui';
import { PrepCoachChat } from '@/features/prep-coach';

import styles from './coach.module.css';

export const metadata: Metadata = {
  title: 'Prep Coach — DevPraxis',
};

export default function CoachPage() {
  return (
    <Protected>
      <main className="container">
        <header className={styles.header}>
          <p className="label">AI assistant</p>
          <h1 className={styles.title}>Prep Coach</h1>
        </header>

        <PrepCoachChat />
      </main>
    </Protected>
  );
}
