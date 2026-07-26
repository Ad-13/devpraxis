import { z } from 'zod';

/** A 24-character hex string — the string form of a MongoDB ObjectId. */
export const objectIdSchema = z.string().regex(/^[0-9a-f]{24}$/i, 'Invalid id');

export const idParamSchema = z.object({ id: objectIdSchema });
