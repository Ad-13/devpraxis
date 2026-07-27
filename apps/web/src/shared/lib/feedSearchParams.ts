import { feedQuerySchema, type FeedQuery } from '@devpraxis/shared';

type RawSearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_QUERY: FeedQuery = feedQuerySchema.parse({});

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseFeedSearchParams(raw: RawSearchParams): FeedQuery {
  const flat: Record<string, string> = {};

  for (const [key, value] of Object.entries(raw)) {
    const single = firstValue(value);
    if (single !== undefined && single !== '') flat[key] = single;
  }

  const parsed = feedQuerySchema.safeParse(flat);
  return parsed.success ? parsed.data : DEFAULT_QUERY;
}

export function buildFeedHref(query: FeedQuery, overrides: Partial<FeedQuery> = {}): string {
  const merged: FeedQuery = { ...query, ...overrides };
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined) continue;
    if (value === DEFAULT_QUERY[key as keyof FeedQuery]) continue;
    params.set(key, String(value));
  }

  const serialised = params.toString();
  return serialised ? `/?${serialised}` : '/';
}

export function feedQueryKey(query: FeedQuery): string {
  return buildFeedHref(query);
}
