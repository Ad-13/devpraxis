import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getSession } from '@/entities/session/api/getSession';
import { FavoritesView } from '@/views/FavoritesView';

export const metadata: Metadata = {
  title: 'Saved articles — DevPraxis',
};

export default async function FavoritesPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  return <FavoritesView />;
}
