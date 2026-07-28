import Link from 'next/link';

import { getArticleBySlug } from '@/entities/article/api/getArticleBySlug';
import { ArticleBody } from '@/entities/article/ui/ArticleBody';
import { ArticleToc } from '@/entities/article/ui/ArticleToc';
import { getSession } from '@/entities/session/api/getSession';
import { getTopics } from '@/entities/topic/api/getTopics';
import { ArticleAiPanel } from '@/features/ai-tools';
import { FavoriteButton } from '@/features/favorite/ui/FavoriteButton';
import { extractHeadings } from '@/shared/lib/toc';

import styles from './ArticleView.module.css';
import { buttonClass } from '@/shared/ui/Button';

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

  const headings = extractHeadings(article.content);

  return (
    <main className={`container ${styles.screen}`}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">← Back to the feed</Link>
      </nav>

      <div className={styles.layout}>
        <aside className={styles.side}>
          <ArticleToc headings={headings} />
        </aside>

        <div className={styles.main}>
          <header className={styles.header}>
            <div className={styles.headBar}>
              <span className={styles.headLabel}>Article</span>
              <span className={styles.headMeta}>{article.language}</span>
            </div>

            <div className={styles.headBody}>
              <ul className={styles.topics}>
                {article.topicIds.map((id) => (
                  <li key={id} className={styles.topic}>
                    {topicNames.get(id) ?? '—'}
                  </li>
                ))}
              </ul>

              <h1 className={styles.title}>{article.title}</h1>

              <div className={styles.meta}>
                {article.publishedAt && (
                  <time dateTime={article.publishedAt}>
                    {dateFormatter.format(new Date(article.publishedAt))}
                  </time>
                )}
                <span>{article.favoritesCount} saved</span>
              </div>

              <div className={styles.actions}>
                {user?.id === article.authorId && (
                  <Link
                    href={`/articles/${article.slug}/edit`}
                    className={buttonClass({ variant: 'ghost', size: 'sm' })}
                  >
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
            </div>
          </header>

          {user && <ArticleAiPanel articleId={article.id} articleLanguage={article.language} />}

          <div className={styles.content}>
            <ArticleBody content={article.content} />
          </div>
        </div>
      </div>
    </main>
  );
}
