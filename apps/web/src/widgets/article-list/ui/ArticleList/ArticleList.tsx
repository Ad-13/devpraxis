import type { FeedQuery } from '@devpraxis/shared';

import { getArticleFeed } from '@/entities/article/api/getArticleFeed';
import { ArticleCard } from '@/entities/article/ui/ArticleCard';
import { getTopics } from '@/entities/topic/api/getTopics';
import { buildFeedHref } from '@/shared/lib/feedSearchParams';
import { Pagination } from '@/shared/ui/Pagination';

import styles from './ArticleList.module.css';

interface IProps {
  query: FeedQuery;
}

export async function ArticleList({ query }: IProps) {
  const [feed, topics] = await Promise.all([getArticleFeed(query), getTopics()]);

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

      <ul className={styles.grid}>
        {feed.data.map((article) => (
          <li key={article.id}>
            <ArticleCard article={article} topicNames={topicNames} />
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
