import type { ReactNode } from 'react';

import { getSession } from '@/entities/session/api/getSession';

import { SessionGate } from './SessionGate';

export async function Protected({ children }: { children: ReactNode }) {
  const { user } = await getSession();

  if (!user) return <SessionGate />;

  return children;
}
