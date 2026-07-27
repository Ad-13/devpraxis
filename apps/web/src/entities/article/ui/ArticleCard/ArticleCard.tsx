import Link from 'next/link';

import type { ArticleListItem } from '@/entities/article/api/getArticleFeed';
import { Frame } from '@/shared/ui/Frame';

import styles from './ArticleCard.module.css';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

interface IProps {
  article: ArticleListItem;
  topicNames: ReadonlyMap<string, string>;
}

export function ArticleCard({ article, topicNames }: IProps) {
  const published = article.publishedAt
    ? dateFormatter.format(new Date(article.publishedAt))
    : null;

  return (
    <Frame as="article" interactive className={styles.card}>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.language}>{article.language}</span>
          {published && <time dateTime={article.publishedAt ?? undefined}>{published}</time>}
        </div>

        <h2 className={styles.title}>
          <Link href={`/articles/${article.slug}`} className={styles.link}>
            {article.title}
          </Link>
        </h2>

        <ul className={styles.topics}>
          {article.topicIds.map((id) => (
            <li key={id} className={styles.topic}>
              {topicNames.get(id) ?? '—'}
            </li>
          ))}
        </ul>

        <p className={styles.favorites}>
          <span className={styles.favoritesCount}>{article.favoritesCount}</span> saved
        </p>
      </div>
    </Frame>
  );
}
