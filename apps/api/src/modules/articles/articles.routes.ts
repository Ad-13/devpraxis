import { Router } from 'express';
import multer from 'multer';

import { requireAuth } from '#middleware/requireAuth';
import { validateBody } from '#middleware/validateBody';
import * as controller from '#modules/articles/articles.controller';
import {
  createArticleSchema,
  notionImportSchema,
  updateArticleSchema,
} from '#modules/articles/article.schemas';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1_000_000 },
});

export const articleRoutes = Router();

articleRoutes.get('/', controller.feed);

articleRoutes.get('/me', requireAuth, controller.mine);
articleRoutes.get('/favorites/me', requireAuth, controller.favorites);
articleRoutes.post('/', requireAuth, validateBody(createArticleSchema), controller.create);
articleRoutes.post('/import/notion', requireAuth, validateBody(notionImportSchema), controller.importNotion);
articleRoutes.post('/import/upload', requireAuth, upload.single('file'), controller.importUpload);

/* wth params */
articleRoutes.get('/:idOrSlug', controller.getOne);
articleRoutes.patch('/:id', requireAuth, validateBody(updateArticleSchema), controller.update);
articleRoutes.post('/:id/publish', requireAuth, controller.publish);
articleRoutes.post('/:id/unpublish', requireAuth, controller.unpublish);
articleRoutes.delete('/:id', requireAuth, controller.remove);
articleRoutes.post('/:id/favorite', requireAuth, controller.favorite);
articleRoutes.delete('/:id/favorite', requireAuth, controller.unfavorite);
