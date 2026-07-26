export const ARTICLE_STATUSES = ['draft', 'published'] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const ARTICLE_SOURCES = ['manual', 'notion', 'upload', 'ai-translation'] as const;
export type ArticleSource = (typeof ARTICLE_SOURCES)[number];

export const ARTICLE_LIMITS = {
  titleMin: 3,
  titleMax: 200,
  topicsMin: 1,
  topicsMax: 3,
  feedPageSizeDefault: 10,
  feedPageSizeMax: 50,
} as const;

export const ARTICLE_SORTS = ['recent', 'popular'] as const;
export type ArticleSort = (typeof ARTICLE_SORTS)[number];
