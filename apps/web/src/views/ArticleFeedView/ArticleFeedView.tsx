import { Suspense } from 'react';

import { ArticleList } from '@/widgets/ArticleList';
import { ArticleListSkeleton } from '@/widgets/ArticleList/ArticleListSkeleton';
import { feedQueryKey, parseFeedSearchParams } from '@/shared/lib/feedSearchParams';

import styles from './ArticleFeedView.module.css';

interface IProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function ArticleFeedView({ searchParams }: IProps) {
  const query = parseFeedSearchParams(await searchParams);

  return (
    <main className="container">
      <header className={styles.header}>
        <p className="label">Knowledge base</p>
        <h1 className={styles.title}>Interview preparation, written by practitioners</h1>
        <p className={styles.lead}>
          Articles on architecture, runtimes and the questions that actually get asked.
        </p>
      </header>

      <Suspense key={feedQueryKey(query)} fallback={<ArticleListSkeleton count={query.limit} />}>
        <ArticleList query={query} />
      </Suspense>
    </main>
  );
}
