import type { RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { z } from 'zod';

export function validateBody<S extends z.ZodType>(
  schema: S,
): RequestHandler<ParamsDictionary, unknown, z.infer<S>> {
  return (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
  };
}
