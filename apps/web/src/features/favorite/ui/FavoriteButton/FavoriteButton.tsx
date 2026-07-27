'use client';

import Link from 'next/link';
import { useOptimistic, useState, useTransition } from 'react';

import { toggleFavoriteAction } from '../../model/actions';

import styles from './FavoriteButton.module.css';

interface OptimisticState {
  isFavorite: boolean;
  count: number;
}

interface IProps {
  articleId: string;
  isFavorite: boolean;
  count: number;
  isAuthenticated: boolean;
}

export function FavoriteButton({ articleId, isFavorite, count, isAuthenticated }: IProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [optimistic, applyOptimistic] = useOptimistic<OptimisticState, boolean>(
    { isFavorite, count },
    (state, next) => ({
      isFavorite: next,
      count: state.count + (next ? 1 : -1),
    }),
  );

  if (!isAuthenticated) {
    return (
      <Link href="/login" className={styles.button} title="Sign in to save articles">
        <span aria-hidden="true">☆</span>
        <span className={styles.count}>{count}</span>
        <span className="visually-hidden">Sign in to save this article</span>
      </Link>
    );
  }

  function handleClick() {
    const next = !optimistic.isFavorite;

    startTransition(async () => {
      applyOptimistic(next);
      setError(null);

      const result = await toggleFavoriteAction(articleId, next);

      if (!result.ok) setError(result.message ?? 'Something went wrong.');
    });
  }

  return (
    <span className={styles.wrapper}>
      <button
        type="button"
        className={styles.button}
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={optimistic.isFavorite}
        aria-label={optimistic.isFavorite ? 'Remove from favourites' : 'Save to favourites'}
      >
        <span aria-hidden="true">{optimistic.isFavorite ? '★' : '☆'}</span>
        <span className={styles.count}>{optimistic.count}</span>
      </button>

      {error && (
        <span className={styles.error} role="status">
          {error}
        </span>
      )}
    </span>
  );
}
