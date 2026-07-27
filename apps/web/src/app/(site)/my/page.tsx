import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getSession } from '@/entities/session/api/getSession';
import { MyArticlesView } from '@/views/MyArticlesView';

export const metadata: Metadata = {
  title: 'My articles — DevPraxis',
};

interface IProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MyArticlesPage({ searchParams }: IProps) {
  const user = await getSession();
  if (!user) redirect('/login');

  return <MyArticlesView searchParams={searchParams} />;
}
