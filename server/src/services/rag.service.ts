import * as qdrantService from './qdrant.service';
import { SearchResult } from './qdrant.service';
import { config } from '../config/env';
import { SourceDoc } from '../types/document.types';

/**
 * RAG retrieval service.
 *
 * Bridges the vector store and the prompt builder: given an embedded query it
 * fetches the most relevant chunks from Qdrant, assembles a clean, delimited
 * context string for the LLM, and surfaces the matching source references so
 * the client can attribute answers. Contains no LLM calls itself.
 */

/**
 * Retrieves the top-K most similar chunks for an embedded query and assembles
 * both the context block injected into the prompt and the source references
 * returned to the client.
 *
 * Each chunk is rendered as `[Source N: <originalName>]\n<text>` and chunks are
 * joined by a blank line. When nothing is retrieved, the context is an empty
 * string and `sourceDocs` is empty.
 */
export const buildContext = async (
  queryVector: number[],
): Promise<{ context: string; sourceDocs: SourceDoc[] }> => {
  const results: SearchResult[] = await qdrantService.searchSimilar(
    queryVector,
    config.ragTopK,
  );

  if (results.length === 0) {
    return { context: '', sourceDocs: [] };
  }

  const context = results
    .map(
      (result, index) =>
        `[Source ${index + 1}: ${result.originalName}]\n${result.text}`,
    )
    .join('\n\n');

  const sourceDocs: SourceDoc[] = results.map((result) => ({
    documentId: result.documentId,
    originalName: result.originalName,
    chunkIndex: result.chunkIndex,
    score: result.score,
  }));

  return { context, sourceDocs };
};
