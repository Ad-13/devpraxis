import type { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

import { ApiError } from '#utils/ApiError';
import * as articlesService from '#modules/articles/articles.service';
import { importFromNotion } from '#modules/articles/import/notion.provider';
import { feedQuerySchema, uploadQuerySchema } from '#modules/articles/article.schemas';

import type {
  CreateArticleDto,
  NotionImportDto,
  UpdateArticleDto,
} from '#modules/articles/article.schemas';
import { currentUserId } from '#utils/currentUserId';


export async function feed(req: Request, res: Response): Promise<void> {
  const q = feedQuerySchema.parse(req.query);
  const { items, meta } = await articlesService.listPublished(q);
  res.json({ data: items, meta });
}

export async function getOne(req: Request<{ idOrSlug: string }>, res: Response): Promise<void> {
  res.json({ data: await articlesService.getPublishedByIdOrSlug(req.params.idOrSlug) });
}

export async function mine(req: Request, res: Response): Promise<void> {
  res.json({ data: await articlesService.listMine(currentUserId(req)) });
}

export async function create(
  req: Request<ParamsDictionary, unknown, CreateArticleDto>,
  res: Response,
): Promise<void> {
  const article = await articlesService.createArticle(currentUserId(req), req.body);
  res.status(201).json({ data: article });
}

export async function update(
  req: Request<{ id: string }, unknown, UpdateArticleDto>,
  res: Response,
): Promise<void> {
  res.json({ data: await articlesService.updateArticle(req.params.id, currentUserId(req), req.body) });
}

export async function publish(req: Request<{ id: string }>, res: Response): Promise<void> {
  res.json({ data: await articlesService.setPublished(req.params.id, currentUserId(req), true) });
}

export async function unpublish(req: Request<{ id: string }>, res: Response): Promise<void> {
  res.json({ data: await articlesService.setPublished(req.params.id, currentUserId(req), false) });
}

export async function remove(req: Request<{ id: string }>, res: Response): Promise<void> {
  await articlesService.deleteArticle(req.params.id, currentUserId(req));
  res.status(204).end();
}

export async function favorite(req: Request<{ id: string }>, res: Response): Promise<void> {
  await articlesService.setFavorite(req.params.id, currentUserId(req), true);
  res.status(204).end();
}

export async function unfavorite(req: Request<{ id: string }>, res: Response): Promise<void> {
  await articlesService.setFavorite(req.params.id, currentUserId(req), false);
  res.status(204).end();
}

export async function favorites(req: Request, res: Response): Promise<void> {
  res.json({ data: await articlesService.listFavorites(currentUserId(req)) });
}

export async function importNotion(
  req: Request<ParamsDictionary, unknown, NotionImportDto>,
  res: Response,
): Promise<void> {
  const { pageId, integrationToken, topicIds, language } = req.body;
  const { title, content } = await importFromNotion(pageId, integrationToken);

  const article = await articlesService.createArticle(
    currentUserId(req),
    { title, content, topicIds, language },
    'notion',
  );
  res.status(201).json({ data: article });
}

export async function importUpload(req: Request, res: Response): Promise<void> {
  if (!req.file) throw ApiError.badRequest('File field "file" (.md) is required');

  const content = req.file.buffer.toString('utf8');
  const h1 = /^#\s+(.+)$/m.exec(content);
  const title = h1?.[1]?.trim() ?? req.file.originalname.replace(/\.md$/i, '');

  const { topicIds, language } = uploadQuerySchema.parse(req.query);

  const article = await articlesService.createArticle(
    currentUserId(req),
    { title, content, topicIds, language },
    'upload',
  );
  res.status(201).json({ data: article });
}
