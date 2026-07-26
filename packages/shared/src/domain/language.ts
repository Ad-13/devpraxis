export const LANGUAGES = ['ru', 'en', 'de'] as const;
export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'ru';

export const LANGUAGE_LABELS: Readonly<Record<Language, string>> = {
  ru: 'Русский',
  en: 'English',
  de: 'Deutsch',
};
