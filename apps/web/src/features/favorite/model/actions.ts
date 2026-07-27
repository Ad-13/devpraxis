'use server';

import { refresh } from 'next/cache';

import { apiServer, isApiClientError } from '@/shared/api';

export interface FavoriteResult {
  ok: boolean;
  message?: string;
}

export async function toggleFavoriteAction(
  articleId: string,
  next: boolean,
): Promise<FavoriteResult> {
  try {
    await apiServer(`/api/articles/${articleId}/favorite`, {
      method: next ? 'POST' : 'DELETE',
    });
  } catch (error) {
    if (isApiClientError(error) && error.status === 401) {
      return { ok: false, message: 'Your session has expired. Sign in again.' };
    }

    return { ok: false, message: 'Could not update favourites. Try again.' };
  }

  refresh();

  return { ok: true };
}
