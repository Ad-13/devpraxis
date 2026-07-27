'use server';

import type { Language } from '@devpraxis/shared';
import { createArticleSchema, DEFAULT_LANGUAGE } from '@devpraxis/shared';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { apiServer, isApiClientError } from '@/shared/api';
import { readString, readStrings } from '@/shared/lib/formData';

import type { ArticleFormState } from '@/features/article-create/model/types';

interface UpdatedArticle {
  id: string;
  slug: string;
}

export async function updateArticleAction(
  articleId: string,
  _previous: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const values = {
    title: readString(formData, 'title'),
    content: readString(formData, 'content'),
    topicIds: readStrings(formData, 'topicIds'),
    language: readString(formData, 'language') as Language || DEFAULT_LANGUAGE,
  };

  const parsed = createArticleSchema.safeParse(values);

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { status: 'error', message: 'Check the highlighted fields.', fieldErrors, values };
  }

  let updated: UpdatedArticle;

  try {
    const result = await apiServer<UpdatedArticle>(`/api/articles/${articleId}`, {
      method: 'PATCH',
      body: parsed.data,
    });
    updated = result.data;
  } catch (error) {
    if (isApiClientError(error)) {
      if (error.status === 403) {
        return { status: 'error', message: 'Only the author can edit this article.', values };
      }
      return { status: 'error', message: error.message, values };
    }
    return { status: 'error', message: 'Could not save the changes. Try again.', values };
  }

  redirect(`/articles/${updated.slug}`);
}
