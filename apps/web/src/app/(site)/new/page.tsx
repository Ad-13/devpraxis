import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getSession } from '@/entities/session/api/getSession';
import { ArticleCreateView } from '@/views/ArticleCreateView';

export const metadata: Metadata = {
  title: 'New article — DevPraxis',
};

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSession();
  if (!user) redirect('/login');

  return <ArticleCreateView searchParams={searchParams} />;
}
