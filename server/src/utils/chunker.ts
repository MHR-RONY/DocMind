// Algorithm tuning parameters (not secrets) — token counts are approximated by
// whitespace-delimited words for a fast, dependency-free heuristic.
export const DEFAULT_CHUNK_SIZE = 1000;
export const DEFAULT_CHUNK_OVERLAP = 200;

/**
 * Splits text into overlapping chunks. `chunkSize` and `overlap` are measured
 * in approximate tokens (words). Guarantees forward progress (no infinite
 * loops) by enforcing overlap < chunkSize.
 */
export const splitTextIntoChunks = (
  text: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  overlap: number = DEFAULT_CHUNK_OVERLAP
): string[] => {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const size = chunkSize > 0 ? Math.floor(chunkSize) : DEFAULT_CHUNK_SIZE;
  let step = Math.floor(overlap);
  if (step < 0) {
    step = 0;
  }
  // Ensure overlap is strictly smaller than the chunk size to guarantee progress.
  if (step >= size) {
    step = size - 1;
  }

  const words = trimmed.split(/\s+/);
  if (words.length <= size) {
    return [words.join(' ')];
  }

  const chunks: string[] = [];
  const advance = size - step;
  for (let start = 0; start < words.length; start += advance) {
    const slice = words.slice(start, start + size);
    chunks.push(slice.join(' '));
    if (start + size >= words.length) {
      break;
    }
  }

  return chunks;
};
