import { APIResponseError, APIErrorCode, Client } from '@notionhq/client';

import { ApiError } from '#utils/ApiError';

export interface NotionImportResult {
  title: string;
  content: string;
}

export async function importFromNotion(
  pageId: string,
  integrationToken: string,
): Promise<NotionImportResult> {
  const notion = new Client({ auth: integrationToken });

  try {
    const { markdown: content } = await notion.pages.retrieveMarkdown({ page_id: pageId });

    const h1 = /^#\s+(.+)$/m.exec(content);
    const title = h1?.[1]?.trim() ?? 'Imported from Notion';

    return { title, content };
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
