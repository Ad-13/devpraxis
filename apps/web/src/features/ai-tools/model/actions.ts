'use server';

import { AI_LIMITS, type Language } from '@devpraxis/shared';
import { redirect } from 'next/navigation';

import { apiServer, isApiClientError } from '@/shared/api';

export interface QuestionItem {
  question: string;
  answer: string;
}

export type AiResult<T> = { ok: true; data: T } | { ok: false; message: string };

function toFailure(error: unknown, fallback: string): { ok: false; message: string } {
  if (isApiClientError(error)) {
    if (error.status === 401) return { ok: false, message: 'Sign in again to use AI tools.' };
    if (error.code === 'RATE_LIMITED') {
      return { ok: false, message: 'Too many AI requests. Wait a few minutes and retry.' };
    }
    if (error.code === 'OFF_TOPIC') {
      return { ok: false, message: 'Prep Coach only answers programming questions.' };
    }
    return { ok: false, message: error.message };
  }

  return { ok: false, message: fallback };
}

export async function generateSummaryAction(articleId: string): Promise<AiResult<string>> {
  try {
    const result = await apiServer<{ summary: string }>(`/api/ai/articles/${articleId}/summary`, {
      method: 'POST',
      body: {},
    });
    return { ok: true, data: result.data.summary };
  } catch (error) {
    return toFailure(error, 'The model did not respond. Try again.');
  }
}

export async function generateQuestionsAction(
  articleId: string,
  count: number = AI_LIMITS.questionsDefault,
): Promise<AiResult<QuestionItem[]>> {
  try {
    const result = await apiServer<{ questions: QuestionItem[] }>(
      `/api/ai/articles/${articleId}/questions`,
      { method: 'POST', body: { count } },
    );
    return { ok: true, data: result.data.questions };
  } catch (error) {
    return toFailure(error, 'The model did not respond. Try again.');
  }
}

export async function translateArticleAction(
  articleId: string,
  targetLang: Language,
): Promise<{ ok: false; message: string } | void> {
  let slug: string;

  try {
    const result = await apiServer<{ slug: string }>(`/api/ai/articles/${articleId}/translate`, {
      method: 'POST',
      body: { targetLang },
    });
    slug = result.data.slug;
  } catch (error) {
    if (isApiClientError(error) && error.status === 409) {
      return { ok: false, message: 'A translation into that language already exists.' };
    }
    return toFailure(error, 'Translation failed. Try again.');
  }

  redirect(`/articles/${slug}/edit`);
}
