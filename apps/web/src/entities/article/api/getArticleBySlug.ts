import 'server-only';

import { cache } from 'react';

import type { ArticleSource, ArticleStatus, Language } from '@devpraxis/shared';

import { apiServer, isApiClientError, type ApiResult } from '@/shared/api';

export interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  language: Language;
  status: ArticleStatus;
  source: ArticleSource;
  topicIds: string[];
  authorId: string;
  favoritesCount: number;
  isFavorite: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getArticleBySlug = cache(
  async (slug: string): Promise<ApiResult<ArticleDetail> | null> => {
    try {
      return await apiServer<ArticleDetail>(`/api/articles/${encodeURIComponent(slug)}`);
    } catch (error) {
      if (isApiClientError(error) && error.status === 404) return null;
      throw error;
    }
  },
);
