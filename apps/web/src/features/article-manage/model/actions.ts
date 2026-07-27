'use server';

import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';

import { apiServer, isApiClientError } from '@/shared/api';

export interface ManageResult {
  ok: boolean;
  message?: string;
}

function toResult(error: unknown, fallback: string): ManageResult {
  if (isApiClientError(error)) {
    if (error.status === 401) {
      return { ok: false, message: 'Your session has expired. Sign in again.' };
    }
    return { ok: false, message: error.message };
  }

  return { ok: false, message: fallback };
}

export async function setArticleStatusAction(
  articleId: string,
  publish: boolean,
): Promise<ManageResult> {
  try {
    await apiServer(`/api/articles/${articleId}/${publish ? 'publish' : 'unpublish'}`, {
      method: 'POST',
    });
  } catch (error) {
    return toResult(error, 'Could not change the status. Try again.');
  }

  // Re-renders the server components of the current route so the row reflects
  // the new status without a full page reload.
  refresh();

  return { ok: true };
}

export async function deleteArticleAction(articleId: string): Promise<ManageResult> {
  try {
    await apiServer(`/api/articles/${articleId}`, { method: 'DELETE' });
  } catch (error) {
    return toResult(error, 'Could not delete the article. Try again.');
  }

  refresh();

  return { ok: true };
}

export async function deleteAndLeaveAction(articleId: string): Promise<ManageResult> {
  const result = await deleteArticleAction(articleId);
  if (!result.ok) return result;

  redirect('/my');
}
