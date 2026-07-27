import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { getArticleBySlug } from '@/entities/article/api/getArticleBySlug';
import { getSession } from '@/entities/session/api/getSession';
import { ArticleEditView } from '@/views/ArticleEditView';

interface IProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: 'Edit article — DevPraxis',
};

export default async function EditArticlePage({ params }: IProps) {
  const { slug } = await params;
  const user = await getSession();

  if (!user) redirect('/login');

  const result = await getArticleBySlug(slug);

  if (!result) notFound();

  if (result.data.authorId !== user.id) notFound();

  return <ArticleEditView slug={slug} />;
}
