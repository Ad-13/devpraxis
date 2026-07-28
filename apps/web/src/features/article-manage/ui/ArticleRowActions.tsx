'use client';

import type { ArticleStatus } from '@devpraxis/shared';
import { useState, useTransition } from 'react';

import { ConfirmButton } from '@/shared/ui/ConfirmButton';

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

      <ConfirmButton
        className={`${styles.button} ${styles.danger}`}
        disabled={isPending}
        title="Delete this article?"
        description={`“${title}” will be removed permanently, together with everyone's bookmarks of it. This cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={remove}
      >
        Delete
      </ConfirmButton>

      {error && (
        <span className={styles.error} role="status">
          {error}
        </span>
      )}
    </div>
  );
}
