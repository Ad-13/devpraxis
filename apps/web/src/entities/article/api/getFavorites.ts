import 'server-only';

import { apiServer } from '@/shared/api';

import type { ArticleListItem } from './getArticleFeed';

export async function getFavorites() {
  return apiServer<ArticleListItem[]>('/api/articles/favorites/me');
}
