import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getArticleBySlug } from '@/entities/article/api/getArticleBySlug';
import { excerpt } from '@/shared/lib/excerpt';
import { ArticleView } from '@/views/article';

interface IProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArticleBySlug(slug);

  if (!result) {
    return { title: 'Article not found — DevPraxis' };
  }

  const article = result.data;
  const description = excerpt(article.content);

  return {
    title: `${article.title} — DevPraxis`,
    description,
    openGraph: {
      type: 'article',
      title: article.title,
      description,
      publishedTime: article.publishedAt ?? undefined,
    },
  };
}

export default async function ArticlePage({ params }: IProps) {
  const { slug } = await params;
  const result = await getArticleBySlug(slug);

  if (!result) notFound();

  return <ArticleView slug={slug} />;
}
