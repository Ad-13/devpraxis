import { Router } from 'express';

import { validateBody } from '#middleware/validateBody';
import * as authController from '#modules/auth/auth.controller';
import { loginSchema, registerSchema } from '#modules/auth/auth.schemas';

export const authRoutes = Router();

authRoutes.post('/register', validateBody(registerSchema), authController.register);
authRoutes.post('/login', validateBody(loginSchema), authController.login);
authRoutes.post('/refresh', authController.refresh);
authRoutes.post('/logout', authController.logout);
