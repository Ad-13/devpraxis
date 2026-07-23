export const ACCENTS = ['gold', 'crimson', 'cyan'] as const;

export type Accent = (typeof ACCENTS)[number];

export const DEFAULT_ACCENT: Accent = 'gold';

export const ACCENT_COOKIE = 'accent';

/** Narrows an untrusted cookie value to a known accent, falling back safely. */
export function parseAccent(raw: string | undefined): Accent {
  return ACCENTS.includes(raw as Accent) ? (raw as Accent) : DEFAULT_ACCENT;
}

export function accentAttribute(accent: Accent): Accent | undefined {
  return accent === DEFAULT_ACCENT ? undefined : accent;
}
