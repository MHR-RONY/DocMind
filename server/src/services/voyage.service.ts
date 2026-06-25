import { config } from '../config/env';
import { voyageClient } from '../config/voyage';
import { ApiError } from '../utils/ApiError';

/**
 * Voyage AI embeddings service.
 *
 * Wraps the thin `voyageClient` HTTP transport with typed request/response
 * handling. The API key lives only on the transport and is never referenced,
 * logged, or surfaced in errors here.
 */

/** A single embedding entry in the Voyage `/embeddings` response. */
interface VoyageEmbeddingData {
  embedding: number[];
  index: number;
}

/** Token usage block returned by Voyage (fields are informational only). */
interface VoyageUsage {
  total_tokens: number;
}

/** Shape of the Voyage `/embeddings` API response body. */
interface VoyageEmbeddingResponse {
  data: VoyageEmbeddingData[];
  model: string;
  usage: VoyageUsage;
}

const isEmbeddingResponse = (
  value: unknown,
): value is VoyageEmbeddingResponse => {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const candidate = value as { data?: unknown };
  if (!Array.isArray(candidate.data)) {
    return false;
  }
  return candidate.data.every((entry) => {
    if (entry === null || typeof entry !== 'object') {
      return false;
    }
    const item = entry as { embedding?: unknown; index?: unknown };
    return (
      Array.isArray(item.embedding) &&
      item.embedding.every((n) => typeof n === 'number') &&
      typeof item.index === 'number'
    );
  });
};

/**
 * Generates an embedding vector for a single text input.
 *
 * @throws ApiError.internal on a malformed or empty Voyage response.
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  const vectors = await generateEmbeddings([text]);
  const first = vectors[0];
  if (!first) {
    throw ApiError.internal('Embedding generation failed');
  }
  return first;
};

/**
 * Generates embedding vectors for a batch of text inputs. The returned array
 * is ordered to match the input order (Voyage may return entries out of order,
 * so results are re-sorted by `index`).
 *
 * @throws ApiError.internal on a malformed response or count mismatch.
 */
export const generateEmbeddings = async (
  texts: string[],
): Promise<number[][]> => {
  if (texts.length === 0) {
    return [];
  }

  let response: unknown;
  try {
    response = await voyageClient.post<unknown>('/embeddings', {
      input: texts,
      model: config.voyage.model,
    });
  } catch {
    // Never propagate the raw transport error — it could contain request
    // context. The transport already guarantees the API key is never included,
    // but we collapse to a generic operational error regardless.
    throw ApiError.internal('Embedding generation failed');
  }

  if (!isEmbeddingResponse(response) || response.data.length !== texts.length) {
    throw ApiError.internal('Embedding generation failed');
  }

  const ordered = [...response.data].sort((a, b) => a.index - b.index);
  return ordered.map((entry) => entry.embedding);
};
