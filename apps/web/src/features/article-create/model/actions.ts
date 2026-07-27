'use server';

import {
  ARTICLE_LIMITS,
  DEFAULT_LANGUAGE,
  createArticleSchema,
  notionImportSchema,
} from '@devpraxis/shared';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { apiServer, isApiClientError } from '@/shared/api';
import { readFile, readString, readStrings } from '@/shared/lib/formData';

import type { ArticleFormState } from './types';

interface CreatedArticle {
  id: string;
  slug: string;
}

const metaSchema = createArticleSchema.pick({ topicIds: true, language: true });

function readMeta(formData: FormData) {
  return {
    topicIds: readStrings(formData, 'topicIds'),
    language: readString(formData, 'language') || DEFAULT_LANGUAGE,
  };
}

function toErrorState(error: unknown, values: ArticleFormState['values']): ArticleFormState {
  if (isApiClientError(error)) {
    return { status: 'error', message: error.message, values };
  }

  return { status: 'error', message: 'Something went wrong. Please try again.', values };
}

async function publish(article: CreatedArticle): Promise<void> {
  await apiServer(`/api/articles/${article.id}/publish`, { method: 'POST' });
}

export async function createArticleAction(
  _previous: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const meta = readMeta(formData);
  const values = {
    title: readString(formData, 'title'),
    content: readString(formData, 'content'),
    ...meta,
  };

  const parsed = createArticleSchema.safeParse(values);

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { status: 'error', message: 'Check the highlighted fields.', fieldErrors, values };
  }

  let created: CreatedArticle;

  try {
    const result = await apiServer<CreatedArticle>('/api/articles', {
      method: 'POST',
      body: parsed.data,
    });
    created = result.data;
    await publish(created);
  } catch (error) {
    return toErrorState(error, values);
  }

  redirect(`/articles/${created.slug}`);
}

export async function uploadArticleAction(
  _previous: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const meta = readMeta(formData);
  const values = { ...meta };

  const parsedMeta = metaSchema.safeParse(meta);

  if (!parsedMeta.success) {
    const { fieldErrors } = z.flattenError(parsedMeta.error);
    return { status: 'error', message: 'Check the highlighted fields.', fieldErrors, values };
  }

  const file = readFile(formData, 'file');

  if (!file || file.size === 0) {
    return { status: 'error', message: 'Choose a .md file to upload.', values };
  }

  if (!file.name.toLowerCase().endsWith('.md')) {
    return { status: 'error', message: 'Only .md files are accepted.', values };
  }

  if (file.size > ARTICLE_LIMITS.uploadMaxBytes) {
    return { status: 'error', message: 'The file must be smaller than 1 MB.', values };
  }

  const query = new URLSearchParams({
    topicIds: parsedMeta.data.topicIds.join(','),
    language: parsedMeta.data.language,
  });

  const outgoing = new FormData();
  outgoing.append('file', file, file.name);

  let created: CreatedArticle;

  try {
    const result = await apiServer<CreatedArticle>(
      `/api/articles/import/upload?${query.toString()}`,
      { method: 'POST', body: outgoing },
    );
    created = result.data;
    await publish(created);
  } catch (error) {
    return toErrorState(error, values);
  }

  redirect(`/articles/${created.slug}`);
}

export async function importNotionAction(
  _previous: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const meta = readMeta(formData);
  const values = { pageId: readString(formData, 'pageId'), ...meta };

  const parsed = notionImportSchema.safeParse({
    pageId: values.pageId,
    integrationToken: readString(formData, 'integrationToken'),
    ...meta,
  });

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { status: 'error', message: 'Check the highlighted fields.', fieldErrors, values };
  }

  let created: CreatedArticle;

  try {
    const result = await apiServer<CreatedArticle>('/api/articles/import/notion', {
      method: 'POST',
      body: parsed.data,
    });
    created = result.data;
    await publish(created);
  } catch (error) {
    return toErrorState(error, values);
  }

  redirect(`/articles/${created.slug}`);
}
