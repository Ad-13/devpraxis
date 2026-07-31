export const AI_MODEL_IDS = ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b'] as const;

export type AiModelId = (typeof AI_MODEL_IDS)[number];

export const DEFAULT_AI_MODEL: AiModelId = 'llama-3.3-70b-versatile';

export const AI_MODELS: ReadonlyArray<{ id: AiModelId; label: string; isDefault: boolean }> = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B — faster bursts', isDefault: true },
  { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B — larger daily budget', isDefault: false },
];

export const AI_LIMITS = {
  questionsMin: 3,
  questionsMax: 10,
  questionsDefault: 5,
  chatMessagesMax: 20,
  chatMessageLength: 4000,
} as const;
