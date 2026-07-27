import 'server-only';

import type { ArticleStatus } from '@devpraxis/shared';

import { apiServer } from '@/shared/api';

import type { ArticleListItem } from './getArticleFeed';

export async function getMyArticles(status?: ArticleStatus) {
  const query = status ? `?status=${status}` : '';
  return apiServer<ArticleListItem[]>(`/api/articles/me${query}`);
}
