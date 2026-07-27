'use client';

import { useState, useTransition } from 'react';

import type { TopicItem } from '@/entities/topic/api/getTopics';

import { deleteTopicAction } from '../model/actions';

import { TopicQuickCreate } from './TopicQuickCreate';
import styles from './TopicManager.module.css';

export function TopicManager({ topics }: { topics: readonly TopicItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove(topic: TopicItem) {
    if (!window.confirm(`Delete the topic “${topic.name}”?`)) return;

    startTransition(async () => {
      setError(null);
      const result = await deleteTopicAction(topic.id);
      if (!result.ok) setError(result.message ?? 'Something went wrong.');
    });
  }

  return (
    <>
      <TopicQuickCreate />

      {error && (
        <p className={styles.error} role="status">
          {error}
        </p>
      )}

      {topics.length === 0 ? (
        <p className={styles.empty}>No topics yet.</p>
      ) : (
        <ul className={styles.list}>
          {topics.map((topic) => (
            <li key={topic.id} className={styles.row}>
              <span className={styles.name}>{topic.name}</span>
              <code className={styles.slug}>{topic.slug}</code>
              <button
                type="button"
                className={styles.delete}
                onClick={() => remove(topic)}
                disabled={isPending}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
