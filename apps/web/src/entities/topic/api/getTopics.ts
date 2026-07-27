import 'server-only';

import { cache } from 'react';

import { apiServer } from '@/shared/api';

export interface TopicItem {
  id: string;
  name: string;
  slug: string;
}

export const getTopics = cache(async () => {
  return apiServer<TopicItem[]>('/api/topics');
});
