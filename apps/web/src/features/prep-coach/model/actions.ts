'use server';

import type { ChatMessage } from '@devpraxis/shared';

import { apiServer, isApiClientError } from '@/shared/api';

export type ChatResult = { ok: true; reply: string } | { ok: false; message: string };

export async function sendChatMessageAction(messages: ChatMessage[]): Promise<ChatResult> {
  try {
    const result = await apiServer<{ reply: string }>('/api/ai/chat', {
      method: 'POST',
      body: { messages },
    });
    return { ok: true, reply: result.data.reply };
  } catch (error) {
    if (isApiClientError(error)) {
      if (error.code === 'OFF_TOPIC') {
        return {
          ok: false,
          message: 'I only answer questions about programming and interview prep.',
        };
      }
      if (error.code === 'RATE_LIMITED') {
        return { ok: false, message: 'Too many requests. Wait a few minutes.' };
      }
      if (error.status === 401) return { ok: false, message: 'Sign in again to continue.' };
      return { ok: false, message: error.message };
    }

    return { ok: false, message: 'The assistant did not respond. Try again.' };
  }
}
