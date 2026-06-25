import { config } from '../config/env';
import { qdrantClient } from '../config/qdrant';

/**
 * Qdrant vector store service.
 *
 * Encapsulates all interaction with the Qdrant collection: upserting chunk
 * embeddings, similarity search, and per-document deletion. Higher-level
 * services (RAG/stream) consume the exported `QdrantPoint` and `SearchResult`
 * shapes — keep them stable.
 */

/** Payload stored alongside every embedded chunk vector in Qdrant. */
interface QdrantChunkPayload {
  documentId: string;
  chunkIndex: number;
  text: string;
  originalName: string;
}

/** A point to upsert: a vector plus its identifying payload. */
export interface QdrantPoint {
  id: string;
  vector: number[];
  payload: QdrantChunkPayload;
}

/** A similarity-search hit, flattened from a Qdrant scored point. */
export interface SearchResult {
  documentId: string;
  chunkIndex: number;
  text: string;
  originalName: string;
  score: number;
}

const isChunkPayload = (
  value: Record<string, unknown> | null | undefined,
): value is Record<string, unknown> & QdrantChunkPayload => {
  if (value === null || value === undefined) {
    return false;
  }
  return (
    typeof value.documentId === 'string' &&
    typeof value.chunkIndex === 'number' &&
    typeof value.text === 'string' &&
    typeof value.originalName === 'string'
  );
};

/**
 * Upserts a batch of chunk vectors into the configured collection. Waits for
 * the operation to be applied so callers can rely on read-after-write.
 */
export const upsertVectors = async (points: QdrantPoint[]): Promise<void> => {
  if (points.length === 0) {
    return;
  }

  await qdrantClient.upsert(config.qdrant.collectionName, {
    wait: true,
    points: points.map((point) => ({
      id: point.id,
      vector: point.vector,
      payload: { ...point.payload },
    })),
  });
};

/**
 * Searches the collection for the `topK` chunks most similar to `queryVector`.
 * Malformed payloads (missing/typed-wrong fields) are skipped defensively.
 */
export const searchSimilar = async (
  queryVector: number[],
  topK: number,
): Promise<SearchResult[]> => {
  const results = await qdrantClient.search(config.qdrant.collectionName, {
    vector: queryVector,
    limit: topK,
    with_payload: true,
  });

  const mapped: SearchResult[] = [];
  for (const result of results) {
    const payload = result.payload;
    if (!isChunkPayload(payload)) {
      continue;
    }
    mapped.push({
      documentId: payload.documentId,
      chunkIndex: payload.chunkIndex,
      text: payload.text,
      originalName: payload.originalName,
      score: result.score,
    });
  }

  return mapped;
};

/**
 * Deletes every vector belonging to a document via a payload filter. Waits for
 * the deletion to be applied.
 */
export const deleteVectorsByDocumentId = async (
  documentId: string,
): Promise<void> => {
  await qdrantClient.delete(config.qdrant.collectionName, {
    wait: true,
    filter: {
      must: [{ key: 'documentId', match: { value: documentId } }],
    },
  });
};
