import Link from 'next/link';

import { ArticleBody } from '@/entities/article/ui/ArticleBody';
import { getArticleBySlug } from '@/entities/article/api/getArticleBySlug';
import { getTopics } from '@/entities/topic/api/getTopics';
import { getSession } from '@/entities/session/api/getSession';
import { FavoriteButton } from '@/features/favorite/ui/FavoriteButton';

import styles from './ArticleView.module.css';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

interface IProps {
  slug: string;
}

export async function ArticleView({ slug }: IProps) {
  const [result, topics, user] = await Promise.all([
    getArticleBySlug(slug),
    getTopics(),
    getSession(),
  ]);

  if (!result) return null;

  const article = result.data;
  const topicNames = new Map(topics.data.map((topic) => [topic.id, topic.name]));

  return (
    <main className="container">
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">← Back to the feed</Link>
      </nav>

      <header className={styles.header}>
        <ul className={styles.topics}>
          {article.topicIds.map((id) => (
            <li key={id} className={styles.topic}>
              {topicNames.get(id) ?? '—'}
            </li>
          ))}
        </ul>

        <h1 className={styles.title}>
          {article.title}
          <div className={styles.actions}>
            {user?.id === article.authorId && (
              <Link href={`/articles/${article.slug}/edit`} className={styles.editLink}>
                Edit
              </Link>
            )}
            {article.status === 'published' ? (
              <FavoriteButton
                articleId={article.id}
                isFavorite={article.isFavorite}
                count={article.favoritesCount}
                isAuthenticated={user !== null}
              />
            ) : (
              <span className={styles.draftBadge}>Draft — publish to allow saving</span>
            )}
          </div>
        </h1>

        <p className={styles.meta}>
          <span className={styles.language}>{article.language}</span>
          {article.publishedAt && (
            <time dateTime={article.publishedAt}>
              {dateFormatter.format(new Date(article.publishedAt))}
            </time>
          )}
          <span>{article.favoritesCount} saved</span>
        </p>
      </header>

      <ArticleBody content={article.content} />
    </main>
  );
}
