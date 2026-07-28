import GithubSlugger from 'github-slugger';

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const HEADING = /^(#{2,3})\s+(.+?)\s*#*\s*$/;
const FENCE = /^(```|~~~)/;

function toPlainText(raw: string): string {
  return raw
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim();
}

export function extractHeadings(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();

    if (FENCE.test(trimmed)) {
      inFence = !inFence;
      continue;
    }
    // A `##` inside a code block is code, not a heading.
    if (inFence) continue;

    const match = HEADING.exec(trimmed);
    if (!match) continue;

    const text = toPlainText(match[2] ?? '');
    if (!text) continue;

    items.push({
      id: slugger.slug(text),
      text,
      level: (match[1] ?? '##').length === 2 ? 2 : 3,
    });
  }

  return items;
}
