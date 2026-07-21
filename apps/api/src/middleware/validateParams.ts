import type { RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { z } from 'zod';

export function validateParams<S extends z.ZodType>(schema: S): RequestHandler<ParamsDictionary> {
  return (req, _res, next) => {
    const parsed = schema.parse(req.params);
    Object.assign(req.params, parsed);
    next();
  };
}
