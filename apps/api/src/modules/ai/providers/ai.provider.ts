import OpenAI from 'openai';
import { z } from 'zod';

import { env } from '#config/env';
import { ApiError } from '#utils/ApiError';
import type { AiModelId } from '@devpraxis/shared';

function extractJson(text: string): string {
  const cleaned = text.replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  return start !== -1 && end > start ? cleaned.slice(start, end + 1) : cleaned;
}

export interface CompletionInput {
  model: AiModelId;
  system: string;
  user: string;
}

export interface AIProvider {
  complete(input: CompletionInput): Promise<string>;
  completeStructured<T>(
    schema: z.ZodType<T>,
    schemaName: string,
    input: CompletionInput,
  ): Promise<T>;
}

class OllamaProvider implements AIProvider {
  private readonly client = new OpenAI({ baseURL: env.OLLAMA_BASE_URL, apiKey: 'ollama' });

  async complete(input: CompletionInput): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: input.model,
      messages: [
        { role: 'system', content: input.system },
        { role: 'user', content: input.user },
      ],
    });

    const text = res.choices[0]?.message.content;
    if (!text) throw new ApiError(502, 'AI_ERROR', 'Model returned an empty response');
    return text;
  }

  async completeStructured<T>(
    schema: z.ZodType<T>,
    schemaName: string,
    input: CompletionInput,
  ): Promise<T> {
    const jsonSchema = JSON.stringify(z.toJSONSchema(schema));

    const raw = await this.complete({
      model: input.model,
      system: `${input.system}
        CRITICAL OUTPUT FORMAT: respond with ONLY one valid JSON object conforming to this JSON Schema ("${schemaName}"). 
        No markdown, no code fences, no explanations before or after the JSON.
        ${jsonSchema}`,
      user: input.user,
    });

    try {
      return schema.parse(JSON.parse(extractJson(raw)));
    } catch {
      throw new ApiError(502, 'AI_ERROR', 'Model failed to produce valid structured output');
    }
  }
}

export const aiProvider: AIProvider = new OllamaProvider();
