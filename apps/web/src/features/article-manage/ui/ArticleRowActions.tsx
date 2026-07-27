'use client';

import type { ArticleStatus } from '@devpraxis/shared';
import { useState, useTransition } from 'react';

import { deleteArticleAction, setArticleStatusAction } from '../model/actions';

import styles from './ArticleRowActions.module.css';

interface IProps {
  articleId: string;
  title: string;
  status: ArticleStatus;
}

export function ArticleRowActions({ articleId, title, status }: IProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isPublished = status === 'published';

  function toggleStatus() {
    startTransition(async () => {
      setError(null);
      const result = await setArticleStatusAction(articleId, !isPublished);
      if (!result.ok) setError(result.message ?? 'Something went wrong.');
    });
  }

  function remove() {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;

    startTransition(async () => {
      setError(null);
      const result = await deleteArticleAction(articleId);
      if (!result.ok) setError(result.message ?? 'Something went wrong.');
    });
  }

  return (
    <div className={styles.actions}>
      <button type="button" className={styles.button} onClick={toggleStatus} disabled={isPending}>
        {isPublished ? 'Unpublish' : 'Publish'}
      </button>

      <button
        type="button"
        className={`${styles.button} ${styles.danger}`}
        onClick={remove}
        disabled={isPending}
      >
        Delete
      </button>

      {error && (
        <span className={styles.error} role="status">
          {error}
        </span>
      )}
    </div>
  );
}
