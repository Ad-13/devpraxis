'use client';

import { ARTICLE_SORTS, LANGUAGES, LANGUAGE_LABELS, type FeedQuery } from '@devpraxis/shared';
import { useRouter } from 'next/navigation';
import { useRef, type SubmitEvent } from 'react';

import type { TopicItem } from '@/entities/topic/api/getTopics';
import { buildFilterHref } from '@/shared/lib/feedSearchParams';
import { readString } from '@/shared/lib/formData';

import styles from './FeedFilters.module.css';

const SORT_LABELS: Readonly<Record<(typeof ARTICLE_SORTS)[number], string>> = {
  recent: 'Newest first',
  popular: 'Most saved',
};

interface IProps {
  topics: readonly TopicItem[];
  query: FeedQuery;
}

export function FeedFilters({ topics, query }: IProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const sortRaw = readString(data, 'sort');
    const languageRaw = readString(data, 'language');

    router.push(
      buildFilterHref({
        search: readString(data, 'search').trim(),
        topicId: readString(data, 'topicId'),
        sort: ARTICLE_SORTS.find((value) => value === sortRaw),
        language: LANGUAGES.find((value) => value === languageRaw),
      }),
    );
  }

  function submitNow() {
    formRef.current?.requestSubmit();
  }

  return (
    <form
      ref={formRef}
      action="/"
      method="get"
      onSubmit={handleSubmit}
      className={styles.form}
      role="search"
    >
      <div className={styles.searchField}>
        <label htmlFor="feed-search" className="visually-hidden">
          Search articles
        </label>
        <input
          id="feed-search"
          className={styles.input}
          type="search"
          name="search"
          placeholder="Search by title or content…"
          defaultValue={query.search ?? ''}
        />
        <button type="submit" className={styles.submit}>
          Search
        </button>
      </div>

      <div className={styles.selects}>
        <label className={styles.select}>
          <span className="visually-hidden">Topic</span>
          <select name="topicId" defaultValue={query.topicId ?? ''} onChange={submitNow}>
            <option value="">All topics</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.select}>
          <span className="visually-hidden">Language</span>
          <select name="language" defaultValue={query.language ?? ''} onChange={submitNow}>
            <option value="">All languages</option>
            {LANGUAGES.map((code) => (
              <option key={code} value={code}>
                {LANGUAGE_LABELS[code]}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.select}>
          <span className="visually-hidden">Sort</span>
          <select name="sort" defaultValue={query.sort} onChange={submitNow}>
            {ARTICLE_SORTS.map((value) => (
              <option key={value} value={value}>
                {SORT_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </form>
  );
}
