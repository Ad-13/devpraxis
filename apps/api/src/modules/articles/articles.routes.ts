import { Router } from 'express';
import multer from 'multer';

import { requireAuth } from '#middleware/requireAuth';
import { validateBody } from '#middleware/validateBody';
import * as controller from '#modules/articles/articles.controller';
import {
  createArticleSchema,
  idParamSchema,
  notionImportSchema,
  updateArticleSchema,
} from '@devpraxis/shared';
import { validateParams } from '#middleware/validateParams';
import { requireCsrf } from '#modules/auth/requireCsrf';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1_000_000 },
});

export const articleRoutes = Router();

articleRoutes.get('/', controller.feed);

articleRoutes.get('/me', requireAuth, controller.mine);
articleRoutes.get('/favorites/me', requireAuth, controller.favorites);
articleRoutes.post('/', requireAuth, requireCsrf, validateBody(createArticleSchema), controller.create);
articleRoutes.post('/import/notion', requireAuth, requireCsrf, validateBody(notionImportSchema), controller.importNotion);
articleRoutes.post('/import/upload', requireAuth, requireCsrf, upload.single('file'), controller.importUpload);

/* wth params */
articleRoutes.get('/:idOrSlug', controller.getOne);
articleRoutes.patch('/:id', requireAuth, requireCsrf, validateParams(idParamSchema), validateBody(updateArticleSchema), controller.update);
articleRoutes.post('/:id/publish', requireAuth, requireCsrf, validateParams(idParamSchema), controller.publish);
articleRoutes.post('/:id/unpublish', requireAuth, requireCsrf, validateParams(idParamSchema), controller.unpublish);
articleRoutes.delete('/:id', requireAuth, requireCsrf, validateParams(idParamSchema), controller.remove);
articleRoutes.post('/:id/favorite', requireAuth, requireCsrf, validateParams(idParamSchema), controller.favorite);
articleRoutes.delete('/:id/favorite', requireAuth, requireCsrf, validateParams(idParamSchema), controller.unfavorite);
