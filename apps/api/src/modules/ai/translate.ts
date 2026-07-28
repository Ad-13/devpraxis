const MAX_CHUNK_CHARS = 6000;

export function splitIntoChunks(markdown: string, maxChars = MAX_CHUNK_CHARS): string[] {
  const lines = markdown.split('\n');
  const chunks: string[] = [];
  let current: string[] = [];
  let inFence = false;

  const flush = () => {
    if (current.length > 0) {
      chunks.push(current.join('\n').trim());
      current = [];
    }
  };

  for (const line of lines) {
    if (/^(```|~~~)/.test(line.trim())) inFence = !inFence;

    const isSeam = !inFence && /^#{1,3}\s/.test(line);
    const wouldOverflow = current.join('\n').length + line.length > maxChars;

    if (isSeam && wouldOverflow) flush();

    current.push(line);

    if (!inFence && current.join('\n').length > maxChars * 1.5) flush();
  }

  flush();
  return chunks.filter((chunk) => chunk.length > 0);
}

export function unwrapFence(text: string): string {
  const trimmed = text.trim();
  const match = /^```[a-zA-Z]*\n([\s\S]*)\n```$/.exec(trimmed);
  return match?.[1] ?? trimmed;
}
