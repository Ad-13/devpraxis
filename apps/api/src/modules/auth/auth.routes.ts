import { Router } from 'express';

import { validateBody } from '#middleware/validateBody';
import * as authController from '#modules/auth/auth.controller';
import { loginSchema, registerSchema } from '@devpraxis/shared';
import { requireCsrf } from '#modules/auth/requireCsrf';

export const authRoutes = Router();

authRoutes.post('/register', validateBody(registerSchema), authController.register);
authRoutes.post('/login', validateBody(loginSchema), authController.login);
authRoutes.post('/refresh', requireCsrf, authController.refresh);
authRoutes.post('/logout', requireCsrf, authController.logout);
