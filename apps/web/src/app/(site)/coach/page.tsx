import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getSession } from '@/entities/session/api/getSession';
import { PrepCoachChat } from '@/features/prep-coach';

import styles from './coach.module.css';

export const metadata: Metadata = {
  title: 'Prep Coach — DevPraxis',
};

export default async function CoachPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  return (
    <main className="container">
      <header className={styles['coach-header']}>
        <p className="label">AI assistant</p>
        <h1 className={styles['coach-header-h1']}>Prep Coach</h1>
      </header>

      <PrepCoachChat />
    </main>
  );
}
