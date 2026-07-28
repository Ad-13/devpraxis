import Link from 'next/link';

import type { ArticleListItem } from '@/entities/article/api/getArticleFeed';
import { SummaryButton } from '@/features/ai-tools';
import { FavoriteButton } from '@/features/favorite/ui/FavoriteButton';

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
  isAuthenticated: boolean;
}

export function ArticleCard({ article, topicNames, isAuthenticated }: IProps) {
  const published = article.publishedAt
    ? dateFormatter.format(new Date(article.publishedAt))
    : null;

  return (
    <article className={styles.row}>
      <span className={styles.rail} aria-hidden="true" />

      <span className={styles.lang}>{article.language}</span>

      <div className={styles.body}>
        <h2 className={styles.title}>
          <Link href={`/articles/${article.slug}`} className={styles.link}>
            {article.title}
          </Link>
        </h2>

        <p className={styles.meta}>
          <span className={styles.topics}>
            {article.topicIds.map((id) => topicNames.get(id) ?? '—').join(' · ')}
          </span>
          {published && <time dateTime={article.publishedAt ?? undefined}>{published}</time>}
        </p>
      </div>

      <div className={styles.actions}>
        {isAuthenticated && <SummaryButton articleId={article.id} title={article.title} />}
        <FavoriteButton
          articleId={article.id}
          isFavorite={article.isFavorite}
          count={article.favoritesCount}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </article>
  );
}
