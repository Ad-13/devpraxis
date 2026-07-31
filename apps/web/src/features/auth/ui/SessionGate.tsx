import { redirect } from 'next/navigation';

import { getSession } from '@/entities/session/api/getSession';

import { SessionRecovery } from './SessionRecovery';

export async function SessionGate() {
  const { recoverable } = await getSession();

  if (!recoverable) redirect('/login');

  return (
    <main className="container">
      <SessionRecovery visible redirectOnFail="/login" />
    </main>
  );
}
