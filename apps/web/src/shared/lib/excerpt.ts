export function excerpt(markdown: string, limit = 160): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/<[^>]+>/g, ' ') // raw html tags
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → their text
    .replace(/[#>*_`~|-]/g, ' ') // leftover syntax characters
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= limit) return plain;

  const cut = plain.slice(0, limit);
  const lastSpace = cut.lastIndexOf(' ');

  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`;
}
