'use server';

import { createTopicSchema } from '@devpraxis/shared';
import { refresh } from 'next/cache';
import { z } from 'zod';

import { apiServer, isApiClientError } from '@/shared/api';

export interface TopicResult {
  ok: boolean;
  message?: string;
}

interface CreatedTopic {
  id: string;
  name: string;
  slug: string;
}

export async function createTopicAction(name: string): Promise<TopicResult> {
  const parsed = createTopicSchema.safeParse({ name });

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { ok: false, message: fieldErrors.name?.join('. ') ?? 'Invalid topic name.' };
  }

  try {
    await apiServer<CreatedTopic>('/api/topics', { method: 'POST', body: parsed.data });
  } catch (error) {
    if (isApiClientError(error)) {
      if (error.status === 409) return { ok: false, message: 'That topic already exists.' };
      if (error.status === 401) return { ok: false, message: 'Sign in again to add topics.' };
      return { ok: false, message: error.message };
    }
    return { ok: false, message: 'Could not create the topic. Try again.' };
  }

  refresh();

  return { ok: true };
}

export async function deleteTopicAction(topicId: string): Promise<TopicResult> {
  try {
    await apiServer(`/api/topics/${topicId}`, { method: 'DELETE' });
  } catch (error) {
    if (isApiClientError(error)) {
      if (error.status === 409) {
        return { ok: false, message: 'Articles still use this topic.' };
      }
      return { ok: false, message: error.message };
    }
    return { ok: false, message: 'Could not delete the topic. Try again.' };
  }

  refresh();

  return { ok: true };
}
