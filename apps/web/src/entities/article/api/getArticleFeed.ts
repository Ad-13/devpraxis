import 'server-only';

import type { ArticleSource, ArticleStatus, FeedQueryInput, Language } from '@devpraxis/shared';

import { apiServer } from '@/shared/api';

/** Shape of an article as it appears in the feed, after the API's toJSON transform. */
export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  language: Language;
  status: ArticleStatus;
  source: ArticleSource;
  topicIds: string[];
  authorId: string;
  favoritesCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function toSearchParams(query: FeedQueryInput): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }

  const serialised = params.toString();
  return serialised ? `?${serialised}` : '';
}

export async function getArticleFeed(query: FeedQueryInput = {}) {
  return apiServer<ArticleListItem[]>(`/api/articles${toSearchParams(query)}`);
}
