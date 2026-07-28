'use client';

import { useState, useTransition } from 'react';

import type { TopicItem } from '@/entities/topic/api/getTopics';
import { ConfirmButton } from '@/shared/ui/ConfirmButton';

import { deleteTopicAction } from '../model/actions';

import { TopicQuickCreate } from './TopicQuickCreate';
import styles from './TopicManager.module.css';

export function TopicManager({ topics }: { topics: readonly TopicItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove(topic: TopicItem) {
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
        <ul className={`${styles.list} stagger`}>
          {topics.map((topic) => (
            <li key={topic.id} className={styles.row}>
              <span className={styles.name}>{topic.name}</span>
              <code className={styles.slug}>{topic.slug}</code>

              <ConfirmButton
                variant="danger"
                size="sm"
                disabled={isPending}
                title="Delete this topic?"
                description={`“${topic.name}” will be removed. Topics still used by an article cannot be deleted.`}
                confirmLabel="Delete"
                tone="danger"
                onConfirm={() => remove(topic)}
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
