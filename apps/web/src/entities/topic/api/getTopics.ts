import 'server-only';

import { apiServer } from '@/shared/api';

export interface TopicItem {
  id: string;
  name: string;
  slug: string;
}

export async function getTopics() {
  return apiServer<TopicItem[]>('/api/topics');
}
