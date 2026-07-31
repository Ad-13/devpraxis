import 'server-only';

import { cache } from 'react';

import { apiServer, isApiClientError } from '@/shared/api';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export interface SessionState {
  user: SessionUser | null;
  recoverable: boolean;
}

export const getSession = cache(async (): Promise<SessionState> => {
  try {
    const result = await apiServer<{ user: SessionUser }>('/api/auth/me');
    return { user: result.data.user, recoverable: false };
  } catch (error) {
    if (isApiClientError(error) && error.status === 401) {
      return { user: null, recoverable: error.code === 'TOKEN_EXPIRED' };
    }
    throw error;
  }
});
