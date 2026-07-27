import 'server-only';

import { cache } from 'react';

import { apiServer, isApiClientError } from '@/shared/api';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  try {
    const result = await apiServer<{ user: SessionUser }>('/api/auth/me');
    return result.data.user;
  } catch (error) {
    // 401 is the normal answer for a visitor without a session.
    if (isApiClientError(error) && error.status === 401) return null;
    throw error;
  }
});
