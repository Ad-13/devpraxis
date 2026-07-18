import slugify from '@sindresorhus/slugify';

export async function ensureUniqueSlug(
  source: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(source).slice(0, 80) || 'untitled';
  let candidate = base;
  let n = 2;

  while (await isTaken(candidate)) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}
