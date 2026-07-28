import { ARTICLE_STATUSES, type ArticleStatus } from '@devpraxis/shared';
import Link from 'next/link';

import { getMyArticles } from '@/entities/article/api/getMyArticles';
import { ArticleRowActions } from '@/features/article-manage';

import styles from './MyArticlesView.module.css';
import { buttonClass } from '@/shared/ui/Button';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const TABS = [
  { value: undefined, label: 'All', href: '/my' },
  { value: 'draft', label: 'Drafts', href: '/my?status=draft' },
  { value: 'published', label: 'Published', href: '/my?status=published' },
] as const;

function parseStatus(raw: string | string[] | undefined): ArticleStatus | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return ARTICLE_STATUSES.find((status) => status === value);
}

interface IProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function MyArticlesView({ searchParams }: IProps) {
  const params = await searchParams;
  const status = parseStatus(params.status);
  const { data: articles } = await getMyArticles(status);

  return (
    <main className="container">
      <header className={styles.header}>
        <div>
          <p className="label">Your workspace</p>
          <h1 className={styles.title}>My articles</h1>
        </div>
        <Link href="/new" className={buttonClass({ variant: 'primary' })}>
          New article
        </Link>
      </header>

      <nav className={styles.tabs} aria-label="Status filter">
        {TABS.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={styles.tab}
            aria-current={tab.value === status ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {articles.length === 0 ? (
        <p className={styles.empty}>
          {status === 'draft'
            ? 'No drafts. Everything you wrote is published.'
            : status === 'published'
              ? 'Nothing published yet. Publish a draft to make it visible.'
              : 'You have not written anything yet.'}
        </p>
      ) : (
        <ul className={styles.list}>
          {articles.map((article) => (
            <li key={article.id} className={styles.row}>
              <div className={styles.main}>
                <Link href={`/articles/${article.slug}`} className={styles.link}>
                  {article.title}
                </Link>
                <p className={styles.meta}>
                  <span className={styles.status} data-status={article.status}>
                    {article.status}
                  </span>
                  <span>{article.language}</span>
                  <span>{article.source}</span>
                  <time dateTime={article.updatedAt}>
                    {dateFormatter.format(new Date(article.updatedAt))}
                  </time>
                  <span>{article.favoritesCount} saved</span>
                </p>
              </div>

              <div className={styles.rowActions}>
                <Link
                  href={`/articles/${article.slug}/edit`}
                  className={buttonClass({ variant: 'ghost', size: 'sm' })}
                >
                  Edit
                </Link>
                <ArticleRowActions
                  articleId={article.id}
                  title={article.title}
                  status={article.status}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
