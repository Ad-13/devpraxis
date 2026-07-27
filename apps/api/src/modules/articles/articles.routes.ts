import { Router } from 'express';
import multer from 'multer';

import { attachUser } from '#middleware/attachUser';
import { requireAuth } from '#middleware/requireAuth';
import { validateBody } from '#middleware/validateBody';
import { validateParams } from '#middleware/validateParams';
import * as controller from '#modules/articles/articles.controller';
import { requireCsrf } from '#modules/auth/requireCsrf';
import {
  ARTICLE_LIMITS,
  createArticleSchema,
  idParamSchema,
  notionImportSchema,
  updateArticleSchema,
} from '@devpraxis/shared';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: ARTICLE_LIMITS.uploadMaxBytes },
});

export const articleRoutes = Router();

/* Public, but personalised when the caller happens to be signed in. */
articleRoutes.get('/', attachUser, controller.feed);

articleRoutes.get('/me', requireAuth, controller.mine);
articleRoutes.get('/favorites/me', requireAuth, controller.favorites);
articleRoutes.post('/', requireAuth, requireCsrf, validateBody(createArticleSchema), controller.create);
articleRoutes.post('/import/notion', requireAuth, requireCsrf, validateBody(notionImportSchema), controller.importNotion);
articleRoutes.post('/import/upload', requireAuth, requireCsrf, upload.single('file'), controller.importUpload);

/* with params */
articleRoutes.get('/:idOrSlug', attachUser, controller.getOne);
articleRoutes.patch('/:id', requireAuth, requireCsrf, validateParams(idParamSchema), validateBody(updateArticleSchema), controller.update);
articleRoutes.post('/:id/publish', requireAuth, requireCsrf, validateParams(idParamSchema), controller.publish);
articleRoutes.post('/:id/unpublish', requireAuth, requireCsrf, validateParams(idParamSchema), controller.unpublish);
articleRoutes.delete('/:id', requireAuth, requireCsrf, validateParams(idParamSchema), controller.remove);
articleRoutes.post('/:id/favorite', requireAuth, requireCsrf, validateParams(idParamSchema), controller.favorite);
articleRoutes.delete('/:id/favorite', requireAuth, requireCsrf, validateParams(idParamSchema), controller.unfavorite);
