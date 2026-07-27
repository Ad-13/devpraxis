import { z } from 'zod';

import { ARTICLE_LIMITS, ARTICLE_SORTS, ARTICLE_STATUSES } from '../domain/article.ts';
import { DEFAULT_LANGUAGE, LANGUAGES } from '../domain/language.ts';
import { objectIdSchema } from './common.ts';

const topicIdsSchema = z
  .array(objectIdSchema)
  .min(ARTICLE_LIMITS.topicsMin)
  .max(ARTICLE_LIMITS.topicsMax);

export const createArticleSchema = z.object({
  title: z.string().trim().min(ARTICLE_LIMITS.titleMin).max(ARTICLE_LIMITS.titleMax),
  content: z.string().min(1),
  topicIds: topicIdsSchema,
  language: z.enum(LANGUAGES),
});

export const updateArticleSchema = createArticleSchema.partial();

export const notionImportSchema = z.object({
  pageId: z.string().trim().min(32),
  integrationToken: z.string().trim().min(1),
  topicIds: topicIdsSchema,
  language: z.enum(LANGUAGES),
});

export const feedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(ARTICLE_LIMITS.feedPageSizeMax)
    .default(ARTICLE_LIMITS.feedPageSizeDefault),
  topicId: objectIdSchema.optional(),
  language: z.enum(LANGUAGES).optional(),
  authorId: objectIdSchema.optional(),
  search: z.string().trim().min(1).optional(),
  sort: z.enum(ARTICLE_SORTS).default('recent'),
});

export const uploadQuerySchema = z.object({
  topicIds: z
    .string()
    .min(1, 'topicIds query param is required, e.g. ?topicIds=id1,id2')
    .transform((v) => v.split(',').filter(Boolean))
    .pipe(topicIdsSchema),
  language: z.enum(LANGUAGES).default(DEFAULT_LANGUAGE),
});

export const myArticlesQuerySchema = z.object({
  status: z.enum(ARTICLE_STATUSES).optional(),
});

export type MyArticlesQuery = z.infer<typeof myArticlesQuerySchema>;
export type CreateArticleDto = z.infer<typeof createArticleSchema>;
export type UpdateArticleDto = z.infer<typeof updateArticleSchema>;
export type NotionImportDto = z.infer<typeof notionImportSchema>;
export type FeedQuery = z.infer<typeof feedQuerySchema>;
/** Input shape of the feed query — what a caller may pass before defaults are applied. */
export type FeedQueryInput = z.input<typeof feedQuerySchema>;
export type FeedQueryParams = Partial<FeedQuery>;
