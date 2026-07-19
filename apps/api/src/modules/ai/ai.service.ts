import { DEFAULT_AI_MODEL, type AiModelId } from '#config/aiModels';
import { ApiError } from '#utils/ApiError';
import { ArticleModel, type Language } from '#modules/articles/article.model';
import * as articlesService from '#modules/articles/articles.service';
import { aiProvider } from '#modules/ai/providers/ai.provider';
import { z } from 'zod';
import { buildPrepCoach, run } from '#modules/ai/agent/prepCoach';
import type { ChatDto } from '#modules/ai/ai.schemas';
import { MaxTurnsExceededError } from '@openai/agents';

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

const translationOutputSchema = z.object({ title: z.string(), content: z.string() });

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

  const { title, content } = await aiProvider.completeStructured(
    translationOutputSchema,
    'article_translation',
    {
      model: model ?? DEFAULT_AI_MODEL,
      system: `Translate the technical article to "${targetLang}". Preserve markdown structure exactly. Do NOT translate code blocks, identifiers, or established technical terms that professionals keep in English.`,
      user: `Title: ${article.title}\n\n${clip(article.content)}`,
    },
  );

  const draft = await articlesService.createArticle(
    userId,
    {
      title,
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
  const input = history ? `Conversation so far:\n${history}\n\nuser: ${lastMessage.content}` : lastMessage.content;

  let result;
  try {
    result = await run(buildPrepCoach(model), input, { maxTurns: 12 });
  } catch (err) {
    if (err instanceof MaxTurnsExceededError) {
      throw new ApiError(502, 'AI_ERROR', 'Assistant could not converge on an answer, try rephrasing');
    }
    throw err;
  }
  return { reply: result.finalOutput ?? '' };
}
