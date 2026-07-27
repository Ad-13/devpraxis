import { Suspense } from 'react';

import { getTopics } from '@/entities/topic/api/getTopics';
import { feedQueryKey, parseFeedSearchParams } from '@/shared/lib/feedSearchParams';
import { ArticleList } from '@/widgets/ArticleList';
import { ArticleListSkeleton } from '@/widgets/ArticleList/ArticleListSkeleton';
import { FeedFilters } from '@/widgets/FeedFilters';

import styles from './ArticleFeedView.module.css';

interface IProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function ArticleFeedView({ searchParams }: IProps) {
  const [params, topics] = await Promise.all([searchParams, getTopics()]);
  const query = parseFeedSearchParams(params);

  return (
    <main className="container">
      <header className={styles.header}>
        <p className="label">Knowledge base</p>
        <h1 className={styles.title}>Interview preparation, written by practitioners</h1>
        <p className={styles.lead}>
          Articles on architecture, runtimes and the questions that actually get asked.
        </p>
      </header>

      <FeedFilters topics={topics.data} query={query} />

      <Suspense key={feedQueryKey(query)} fallback={<ArticleListSkeleton count={query.limit} />}>
        <ArticleList query={query} />
      </Suspense>
    </main>
  );
}
