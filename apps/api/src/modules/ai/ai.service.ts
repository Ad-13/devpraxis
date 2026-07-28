import { DEFAULT_AI_MODEL, type AiModelId, type ChatDto, type Language } from '@devpraxis/shared';
import { ApiError } from '#utils/ApiError';
import { ArticleModel } from '#modules/articles/article.model';
import * as articlesService from '#modules/articles/articles.service';
import { aiProvider } from '#modules/ai/providers/ai.provider';
import { z } from 'zod';
import { buildPrepCoach, run } from '#modules/ai/agent/prepCoach';
import { MaxTurnsExceededError } from '@openai/agents';
import { splitIntoChunks, unwrapFence } from '#modules/ai/translate';

const guardrailSchema = z.object({ allowed: z.boolean() });
const MAX_CONTENT_CHARS = 8000;

async function loadArticleForAi(articleId: string, userId: string) {
  const article = await ArticleModel.findById(articleId);
  if (!article || (article.status !== 'published' && String(article.authorId) !== userId)) {
    throw ApiError.notFound('Article not found');
  }
  return article;
}

const clip = (s: string) => (s.length > MAX_CONTENT_CHARS ? s.slice(0, MAX_CONTENT_CHARS) : s);

export async function generateSummary(articleId: string, userId: string, model?: AiModelId) {
  const article = await loadArticleForAi(articleId, userId);

  const summary = await aiProvider.complete({
    model: model ?? DEFAULT_AI_MODEL,
    system:
      'You are a technical editor. Write a concise summary (4-6 sentences) of the article in the SAME language as the article. Plain text, no headings.',
    user: `Title: ${article.title}\n\n${clip(article.content)}`,
  });

  return { summary };
}

const questionsOutputSchema = z.object({
  questions: z.array(z.object({ question: z.string(), answer: z.string() })),
});

export async function generateQuestions(
  articleId: string,
  userId: string,
  count: number,
  model?: AiModelId,
) {
  const article = await loadArticleForAi(articleId, userId);

  const { questions } = await aiProvider.completeStructured(
    questionsOutputSchema,
    'interview_questions',
    {
      model: model ?? DEFAULT_AI_MODEL,
      system: `Generate exactly ${count} interview questions with model answers based ONLY on the article. Same language as the article. Answers 2-4 sentences, precise.`,
      user: `Title: ${article.title}\n\n${clip(article.content)}`,
    },
  );

  return { questions: questions.slice(0, count) };
}

export async function translateArticle(
  articleId: string,
  userId: string,
  targetLang: Language,
  model?: AiModelId,
) {
  const article = await loadArticleForAi(articleId, userId);

  if (article.language === targetLang) {
    throw ApiError.badRequest('Article is already in the target language');
  }

  const existing = await ArticleModel.findOne({ translationOf: articleId, language: targetLang });
  if (existing) {
    throw ApiError.conflict('Translation already exists', { articleId: String(existing._id) });
  }

  const chosenModel = model ?? DEFAULT_AI_MODEL;

  const system = [
    `You translate technical documentation into "${targetLang}".`,
    'Return ONLY the translated markdown. No preamble, no explanation.',
    'Do NOT wrap your answer in a code fence.',
    '',
    'STRUCTURE: preserve it exactly — heading levels, blank lines between blocks,',
    'table pipes, list markers, blockquote markers, emphasis, link syntax.',
    '',
    'INSIDE FENCED BLOCKS, treat code and text differently:',
    '- DO translate comments (// ... , # ... , /* ... */) and any prose.',
    '- DO translate the words in ASCII diagrams, flowcharts and box drawings,',
    '  keeping the same number of lines and the same drawing characters.',
    '- DO NOT translate executable code: keywords, identifiers, function and',
    '  variable names, imports, string literals that are code, CSS properties.',
    '- Keep the language tag on the fence unchanged.',
    '',
    'TERMS: keep established technical vocabulary that professionals use in',
    'English — Layout, Paint, Composite, Reflow, Repaint, Fiber, hook, props,',
    'state, commit, render. Translate the surrounding sentence, not these words.',
  ].join('\n');

  // The whole article, not a truncated prefix: a translation that stops
  // mid-sentence is worse than no translation at all.
  const chunks = splitIntoChunks(article.content);

  const translatedChunks: string[] = [];
  for (const chunk of chunks) {
    // Sequential on purpose: parallel calls would race past the provider's
    // rate limit and lose the shared terminology context.
    const piece = await aiProvider.complete({ model: chosenModel, system, user: chunk });
    translatedChunks.push(unwrapFence(piece).trim());
  }

  const content = translatedChunks.join('\n\n');

  const translatedTitle = await aiProvider.complete({
    model: chosenModel,
    system: `Translate this article title into "${targetLang}". Return only the title, nothing else.`,
    user: article.title,
  });

  const draft = await articlesService.createArticle(
    userId,
    {
      title: unwrapFence(translatedTitle).trim().slice(0, 200),
      content,
      topicIds: article.topicIds.map(String),
      language: targetLang,
    },
    'ai-translation',
    { translationOf: articleId },
  );

  return draft;
}

async function assertOnTopic(text: string, model: AiModelId): Promise<void> {
  const { allowed } = await aiProvider.completeStructured(guardrailSchema, 'topic_guardrail', {
    model,
    system:
      'Classify if the user message is about programming, software engineering, computer science, or tech-interview preparation. Respond with allowed=true/false only.',
    user: text,
  });

  if (!allowed) {
    throw new ApiError(422, 'OFF_TOPIC', 'Prep Coach only answers programming-related questions');
  }
}

export async function chat(dto: ChatDto) {
  const model = dto.model ?? DEFAULT_AI_MODEL;
  const lastMessage = dto.messages.at(-1);
  if (!lastMessage || lastMessage.role !== 'user') {
    throw ApiError.badRequest('Last message must be from the user');
  }

  await assertOnTopic(lastMessage.content, model);

  const history = dto.messages
    .slice(0, -1)
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');
  const input = history
    ? `Conversation so far:\n${history}\n\nuser: ${lastMessage.content}`
    : lastMessage.content;

  let result;
  try {
    result = await run(buildPrepCoach(model), input, { maxTurns: 12 });
  } catch (err) {
    if (err instanceof MaxTurnsExceededError) {
      throw new ApiError(
        502,
        'AI_ERROR',
        'Assistant could not converge on an answer, try rephrasing',
      );
    }
    throw err;
  }
  return { reply: result.finalOutput ?? '' };
}
