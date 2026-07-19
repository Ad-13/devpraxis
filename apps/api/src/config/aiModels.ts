export const AI_MODEL_IDS = ['gpt-oss:120b-cloud'] as const;

export type AiModelId = (typeof AI_MODEL_IDS)[number];

export const DEFAULT_AI_MODEL: AiModelId = 'gpt-oss:120b-cloud';

export const AI_MODELS: ReadonlyArray<{ id: AiModelId; label: string; isDefault: boolean }> = [
  { id: 'gpt-oss:120b-cloud', label: 'GPT-OSS 120B (Ollama Cloud)', isDefault: true },
];
