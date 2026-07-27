import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getSession } from '@/entities/session/api/getSession';
import { TopicsView } from '@/views/TopicsView';

export const metadata: Metadata = {
  title: 'Topics — DevPraxis',
};

export default async function TopicsPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  return <TopicsView />;
}
