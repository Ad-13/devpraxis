import Link from 'next/link';

import type { ArticleListItem } from '@/entities/article/api/getArticleFeed';
import { FavoriteButton } from '@/features/favorite/ui/FavoriteButton';
import { Frame } from '@/shared/ui/Frame';
import { SummaryButton } from '@/features/ai-tools';

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

        <div className={styles.actions}>
          {isAuthenticated && <SummaryButton articleId={article.id} title={article.title} />}
          <FavoriteButton
            articleId={article.id}
            isFavorite={article.isFavorite}
            count={article.favoritesCount}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </Frame>
  );
}
