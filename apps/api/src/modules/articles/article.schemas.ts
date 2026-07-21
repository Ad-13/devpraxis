import { z } from 'zod';

import { LANGUAGES } from '#modules/articles/article.model';

export const objectIdSchema = z.string().regex(/^[0-9a-f]{24}$/i, 'Invalid id');

export const createArticleSchema = z.object({
  title: z.string().trim().min(3).max(200),
  content: z.string().min(1),
  topicIds: z.array(objectIdSchema).min(1).max(3),
  language: z.enum(LANGUAGES),
});

export const updateArticleSchema = createArticleSchema.partial();

export const idParamSchema = z.object({ id: objectIdSchema });

export const notionImportSchema = z.object({
  pageId: z.string().trim().min(32),
  integrationToken: z.string().trim().min(1),
  topicIds: z.array(objectIdSchema).min(1).max(3),
  language: z.enum(LANGUAGES),
});

export const feedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  topicId: objectIdSchema.optional(),
  language: z.enum(LANGUAGES).optional(),
  authorId: objectIdSchema.optional(),
  search: z.string().trim().min(1).optional(),
  sort: z.enum(['recent', 'popular']).default('recent'),
});

export const uploadQuerySchema = z.object({
  topicIds: z
    .string()
    .min(1, 'topicIds query param is required, e.g. ?topicIds=id1,id2')
    .transform((v) => v.split(',').filter(Boolean))
    .pipe(z.array(objectIdSchema).min(1).max(3)),
  language: z.enum(LANGUAGES).default('ru'),
});

export type CreateArticleDto = z.infer<typeof createArticleSchema>;
export type UpdateArticleDto = z.infer<typeof updateArticleSchema>;
export type NotionImportDto = z.infer<typeof notionImportSchema>;
export type FeedQuery = z.infer<typeof feedQuerySchema>;
