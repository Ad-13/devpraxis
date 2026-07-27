import type { z } from 'zod';

import {
  createArticleSchema,
  updateArticleSchema,
  notionImportSchema,
  feedQuerySchema,
  uploadQuerySchema,
  summarySchema,
  questionsSchema,
  translateSchema,
  chatSchema,
  registerSchema,
  loginSchema,
  createTopicSchema,
} from '@devpraxis/shared';

export const schemaRegistry = {
  RegisterInput: registerSchema,
  LoginInput: loginSchema,
  CreateTopicInput: createTopicSchema,
  CreateArticleInput: createArticleSchema,
  UpdateArticleInput: updateArticleSchema,
  NotionImportInput: notionImportSchema,
  FeedQuery: feedQuerySchema,
  UploadQuery: uploadQuerySchema,
  SummaryInput: summarySchema,
  QuestionsInput: questionsSchema,
  TranslateInput: translateSchema,
  ChatInput: chatSchema,
} satisfies Record<string, z.ZodType>;

export type SchemaName = keyof typeof schemaRegistry;

export interface PathEntry {
  method: 'get' | 'post' | 'patch' | 'delete';
  path: string;
  summary: string;
  tags: string[];
  auth: boolean;
  body?: SchemaName;
  query?: SchemaName;
  params?: string[];
  responses: number[];
}

export const pathEntries: PathEntry[] = [
  // Auth
  {
    method: 'post',
    path: '/auth/register',
    summary: 'Register a new user',
    tags: ['Auth'],
    auth: false,
    body: 'RegisterInput',
    responses: [201, 400, 409],
  },
  {
    method: 'post',
    path: '/auth/login',
    summary: 'Log in',
    tags: ['Auth'],
    auth: false,
    body: 'LoginInput',
    responses: [200, 400, 401],
  },
  {
    method: 'post',
    path: '/auth/refresh',
    summary: 'Rotate refresh token, issue a new access token',
    tags: ['Auth'],
    auth: false,
    responses: [200, 401],
  },
  {
    method: 'post',
    path: '/auth/logout',
    summary: 'Revoke the current refresh token',
    tags: ['Auth'],
    auth: false,
    responses: [204],
  },

  // Topics
  {
    method: 'get',
    path: '/topics',
    summary: 'List all topics',
    tags: ['Topics'],
    auth: false,
    responses: [200],
  },
  {
    method: 'post',
    path: '/topics',
    summary: 'Create a topic (deduplicated by slug)',
    tags: ['Topics'],
    auth: true,
    body: 'CreateTopicInput',
    responses: [201, 400, 409],
  },
  {
    method: 'delete',
    path: '/topics/{id}',
    summary: 'Delete a topic (fails if referenced by articles)',
    tags: ['Topics'],
    auth: true,
    params: ['id'],
    responses: [204, 404, 409],
  },

  // Articles
  {
    method: 'get',
    path: '/articles',
    summary: 'Public feed of published articles',
    tags: ['Articles'],
    auth: false,
    query: 'FeedQuery',
    responses: [200],
  },
  {
    method: 'get',
    path: '/articles/me',
    summary: "Current user's articles (all statuses)",
    tags: ['Articles'],
    auth: true,
    responses: [200],
  },
  {
    method: 'get',
    path: '/articles/favorites/me',
    summary: "Current user's favorited articles",
    tags: ['Articles'],
    auth: true,
    responses: [200],
  },
  {
    method: 'post',
    path: '/articles',
    summary: 'Create an article (draft)',
    tags: ['Articles'],
    auth: true,
    body: 'CreateArticleInput',
    responses: [201, 400],
  },
  {
    method: 'post',
    path: '/articles/import/notion',
    summary: 'Import an article from Notion',
    tags: ['Articles'],
    auth: true,
    body: 'NotionImportInput',
    responses: [201, 400],
  },
  {
    method: 'post',
    path: '/articles/import/upload',
    summary: 'Import an article from an uploaded .md file (multipart, field "file")',
    tags: ['Articles'],
    auth: true,
    query: 'UploadQuery',
    responses: [201, 400],
  },
  {
    method: 'get',
    path: '/articles/{idOrSlug}',
    summary: 'Get a published article by id or slug',
    tags: ['Articles'],
    auth: false,
    params: ['idOrSlug'],
    responses: [200, 404],
  },
  {
    method: 'patch',
    path: '/articles/{id}',
    summary: 'Update an article (author only)',
    tags: ['Articles'],
    auth: true,
    params: ['id'],
    body: 'UpdateArticleInput',
    responses: [200, 403, 404],
  },
  {
    method: 'post',
    path: '/articles/{id}/publish',
    summary: 'Publish an article',
    tags: ['Articles'],
    auth: true,
    params: ['id'],
    responses: [200, 403, 404],
  },
  {
    method: 'post',
    path: '/articles/{id}/unpublish',
    summary: 'Unpublish an article',
    tags: ['Articles'],
    auth: true,
    params: ['id'],
    responses: [200, 403, 404],
  },
  {
    method: 'delete',
    path: '/articles/{id}',
    summary: 'Delete an article (author only)',
    tags: ['Articles'],
    auth: true,
    params: ['id'],
    responses: [204, 403, 404],
  },
  {
    method: 'post',
    path: '/articles/{id}/favorite',
    summary: 'Add article to favorites',
    tags: ['Articles'],
    auth: true,
    params: ['id'],
    responses: [204, 404],
  },
  {
    method: 'delete',
    path: '/articles/{id}/favorite',
    summary: 'Remove article from favorites',
    tags: ['Articles'],
    auth: true,
    params: ['id'],
    responses: [204, 404],
  },

  // AI
  {
    method: 'get',
    path: '/ai/models',
    summary: 'List allowed AI models',
    tags: ['AI'],
    auth: true,
    responses: [200],
  },
  {
    method: 'post',
    path: '/ai/articles/{id}/summary',
    summary: 'Generate an article summary',
    tags: ['AI'],
    auth: true,
    params: ['id'],
    body: 'SummaryInput',
    responses: [200, 404, 502],
  },
  {
    method: 'post',
    path: '/ai/articles/{id}/questions',
    summary: 'Generate interview questions for an article',
    tags: ['AI'],
    auth: true,
    params: ['id'],
    body: 'QuestionsInput',
    responses: [200, 404, 502],
  },
  {
    method: 'post',
    path: '/ai/articles/{id}/translate',
    summary: 'Translate an article, creating a draft copy',
    tags: ['AI'],
    auth: true,
    params: ['id'],
    body: 'TranslateInput',
    responses: [201, 400, 404, 409, 502],
  },
  {
    method: 'post',
    path: '/ai/chat',
    summary: 'Chat with the Prep Coach agent',
    tags: ['AI'],
    auth: true,
    body: 'ChatInput',
    responses: [200, 422, 502],
  },
];
