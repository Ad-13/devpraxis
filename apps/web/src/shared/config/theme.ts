export const ACCENTS = ['gold', 'crimson', 'cyan'] as const;

export type Accent = (typeof ACCENTS)[number];

export const DEFAULT_ACCENT: Accent = 'gold';

export const ACCENT_COOKIE = 'accent';

export const ACCENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const ACCENT_LABELS: Readonly<Record<Accent, string>> = {
  gold: 'Gold',
  crimson: 'Crimson',
  cyan: 'Cyan',
};

export function parseAccent(raw: string | undefined): Accent {
  return ACCENTS.includes(raw as Accent) ? (raw as Accent) : DEFAULT_ACCENT;
}

export function accentAttribute(accent: Accent): Accent | undefined {
  return accent === DEFAULT_ACCENT ? undefined : accent;
}
