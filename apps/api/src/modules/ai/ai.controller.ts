import type { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

import { AI_MODELS } from '#config/aiModels';
import { currentUserId } from '#utils/currentUserId';
import * as aiService from '#modules/ai/ai.service';
import { questionsSchema, summarySchema, translateSchema } from '#modules/ai/ai.schemas';
import type { ChatDto } from '#modules/ai/ai.schemas';

export function listModels(_req: Request, res: Response): void {
  res.json({ data: AI_MODELS });
}

export async function summary(req: Request<{ id: string }>, res: Response): Promise<void> {
  const { model } = summarySchema.parse(req.body ?? {});
  res.json({ data: await aiService.generateSummary(req.params.id, currentUserId(req), model) });
}

export async function questions(req: Request<{ id: string }>, res: Response): Promise<void> {
  const { model, count } = questionsSchema.parse(req.body ?? {});
  res.json({
    data: await aiService.generateQuestions(req.params.id, currentUserId(req), count, model),
  });
}

export async function translate(req: Request<{ id: string }>, res: Response): Promise<void> {
  const { model, targetLang } = translateSchema.parse(req.body ?? {});
  const draft = await aiService.translateArticle(
    req.params.id,
    currentUserId(req),
    targetLang,
    model,
  );
  res.status(201).json({ data: draft });
}

export async function chat(
  req: Request<ParamsDictionary, unknown, ChatDto>,
  res: Response,
): Promise<void> {
  res.json({ data: await aiService.chat(req.body) });
}
