'use client';

import { useState, useTransition } from 'react';

import type { TopicItem } from '@/entities/topic/api/getTopics';

import { deleteTopicAction } from '../model/actions';

import { TopicQuickCreate } from './TopicQuickCreate';
import styles from './TopicManager.module.css';
import { ConfirmButton } from '@/shared/ui/ConfirmButton';

export function TopicManager({ topics }: { topics: readonly TopicItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove(topicId: string) {
    startTransition(async () => {
      setError(null);
      const result = await deleteTopicAction(topicId);
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

              <ConfirmButton
                className={`${styles.button} ${styles.danger}`}
                disabled={isPending}
                title="Delete this article?"
                description={`Delete the topic “${topic.name}”?`}
                confirmLabel="Delete"
                tone="danger"
                onConfirm={() => remove(topic.id)}
              >
                Delete
              </ConfirmButton>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
