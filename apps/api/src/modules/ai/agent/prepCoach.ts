import OpenAI from 'openai';
import {
  Agent,
  run,
  tool,
  setDefaultOpenAIClient,
  setOpenAIAPI,
  setTracingDisabled,
} from '@openai/agents';
import { z } from 'zod';

import { env } from '#config/env';
import { DEFAULT_AI_MODEL, LANGUAGES, type AiModelId } from '@devpraxis/shared';
import { ArticleModel } from '#modules/articles/article.model';

setDefaultOpenAIClient(new OpenAI({ baseURL: env.OLLAMA_BASE_URL, apiKey: 'ollama' }));
setOpenAIAPI('chat_completions');
setTracingDisabled(true);

const searchArticles = tool({
  name: 'search_articles',
  description:
    'Full-text search over published knowledge-base articles. Returns up to 5 matches with id, title, language.',
  parameters: z.object({
    query: z.string(),
    language: z.enum(LANGUAGES).nullable(),
  }),
  execute: async ({ query, language }) => {
    const filter: Record<string, unknown> = { status: 'published', $text: { $search: query } };
    if (language) filter.language = language;

    const items = await ArticleModel.find(filter)
      .limit(5)
      .select('title language slug')
      .lean();

    return JSON.stringify(
      items.map((a) => ({ id: String(a._id), title: a.title, language: a.language })),
    );
  },
});

const getArticle = tool({
  name: 'get_article',
  description: 'Fetch full content of a published article by its id (from search_articles results).',
  parameters: z.object({ id: z.string() }),
  execute: async ({ id }) => {
    const article = await ArticleModel.findOne({ _id: id, status: 'published' }).lean();
    if (!article) return 'Article not found';
    return `# ${article.title}\n\n${article.content.slice(0, 6000)}`;
  },
});

export function buildPrepCoach(model: AiModelId = DEFAULT_AI_MODEL): Agent {
  return new Agent({
    name: 'Prep Coach',
    model,
    instructions:
      `You are an interview-prep coach for a developer cohort. 
      ALWAYS search the knowledge base first (search_articles), read relevant articles (get_article), and ground your answer in them, mentioning article titles. 
      If the base has nothing relevant, say so explicitly before answering from general knowledge. 
      Answer in the language of the user question. 
      Use AT MOST 2 search_articles calls and AT MOST 2 get_article calls per question. 
      After that, answer with what you have.
      Answer style:
      - Keep answers SHORT: 3-6 sentences of substance, no headings, no tables, minimal markdown.
      - When your answer is based on knowledge-base articles, END with a "Read More:" line listing the article titles you used.
      - If the knowledge base has NO relevant article: say so in one sentence, give a 2-3 sentence answer from general knowledge, and suggest that this topic deserves a new article in the base.`,
    tools: [searchArticles, getArticle],
  });
}

export { run };
