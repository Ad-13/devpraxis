import type { FeedQuery } from '@devpraxis/shared';

import { getArticleFeed } from '@/entities/article/api/getArticleFeed';
import { ArticleCard } from '@/entities/article/ui/ArticleCard';
import { getSession } from '@/entities/session/api/getSession';
import { getTopics } from '@/entities/topic/api/getTopics';
import { buildFeedHref } from '@/shared/lib/feedSearchParams';
import { Pagination } from '@/shared/ui/Pagination';

import styles from './ArticleList.module.css';

interface IProps {
  query: FeedQuery;
}

export async function ArticleList({ query }: IProps) {
  const [feed, topics, session] = await Promise.all([
    getArticleFeed(query),
    getTopics(),
    getSession(),
  ]);

  const topicNames = new Map(topics.data.map((topic) => [topic.id, topic.name]));
  const total = feed.meta?.total ?? feed.data.length;
  const pages = feed.meta?.pages ?? 1;

  if (feed.data.length === 0) {
    return (
      <p className={styles.empty}>
        {query.search
          ? `Nothing found for “${query.search}”.`
          : 'No published articles yet. The first one is waiting to be written.'}
      </p>
    );
  }

  return (
    <>
      <p className={styles.count}>
        {total} article{total === 1 ? '' : 's'}
      </p>

      <ul className={`${styles.list} stagger`}>
        {feed.data.map((article) => (
          <li key={article.id}>
            <ArticleCard
              article={article}
              topicNames={topicNames}
              isAuthenticated={session.user !== null}
            />
          </li>
        ))}
      </ul>

      <Pagination
        page={query.page}
        pages={pages}
        buildHref={(page) => buildFeedHref(query, { page })}
      />
    </>
  );
}
