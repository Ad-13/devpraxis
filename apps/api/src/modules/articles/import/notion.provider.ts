import { APIResponseError, APIErrorCode, Client } from '@notionhq/client';

import { ApiError } from '#utils/ApiError';

import { normalizeMarkdown, stripLeadingH1 } from '#modules/articles/import/markdown';

export interface NotionImportResult {
  title: string;
  content: string;
}

function extractTitle(page: unknown): string | null {
  if (typeof page !== 'object' || page === null || !('properties' in page)) return null;

  const properties = page.properties;
  if (typeof properties !== 'object' || properties === null) return null;

  for (const value of Object.values(properties as Record<string, unknown>)) {
    if (typeof value !== 'object' || value === null) continue;
    if ((value as { type?: unknown }).type !== 'title') continue;

    const parts = (value as { title?: unknown }).title;
    if (!Array.isArray(parts)) continue;

    const text = parts
      .map((part: unknown) =>
        typeof part === 'object' && part !== null && 'plain_text' in part
          ? String(part.plain_text)
          : '',
      )
      .join('')
      .trim();

    if (text) return text;
  }

  return null;
}

export async function importFromNotion(
  pageId: string,
  integrationToken: string,
): Promise<NotionImportResult> {
  const notion = new Client({ auth: integrationToken });

  try {
    const [page, { markdown }] = await Promise.all([
      notion.pages.retrieve({ page_id: pageId }),
      notion.pages.retrieveMarkdown({ page_id: pageId }),
    ]);

    const normalized = normalizeMarkdown(markdown);
    const h1 = /^#\s+(.+)$/m.exec(normalized);
    const title = extractTitle(page) ?? h1?.[1]?.trim() ?? 'Imported from Notion';

    return { title, content: stripLeadingH1(normalized, title) };
  } catch (err) {
    if (err instanceof APIResponseError) {
      if (err.code === APIErrorCode.ObjectNotFound) {
        throw ApiError.badRequest(
          'Notion page not found or not shared with the integration. In Notion: Share → Connections → add your integration.',
        );
      }
      if (err.code === APIErrorCode.Unauthorized) {
        throw ApiError.badRequest('Invalid Notion integration token');
      }
    }
    throw err;
  }
}
