/**
 * Splits content into smaller chunks based on sentence boundaries
 * @param content The text content to chunk
 * @param chunkSize Maximum size of each chunk in characters
 * @returns Array of text chunks
 */
export function chunkContent(
  content: string,
  chunkSize: number = 1000,
): string[] {
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if (
      currentChunk.length + sentence.length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim() + ".");
      currentChunk = sentence.trim();
    } else {
      currentChunk += (currentChunk.length > 0 ? ". " : "") + sentence.trim();
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim() + ".");
  }

  return chunks.length > 0 ? chunks : [content];
}
