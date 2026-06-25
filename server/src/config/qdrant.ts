import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from './env';

/**
 * Shared Qdrant client instance, configured from validated env.
 * `apiKey` is optional (local/dev Qdrant instances often run without one).
 */
export const qdrantClient = new QdrantClient({
  url: config.qdrant.url,
  apiKey: config.qdrant.apiKey,
});

/**
 * Ensures the configured collection exists, creating it with the correct
 * vector size (Voyage embedding dimension) and Cosine distance if absent.
 * Safe to call on every startup — it is a no-op when the collection exists.
 */
export async function ensureCollection(): Promise<void> {
  const collectionName = config.qdrant.collectionName;

  const { collections } = await qdrantClient.getCollections();
  const exists = collections.some(
    (collection) => collection.name === collectionName,
  );

  if (exists) {
    // eslint-disable-next-line no-console
    console.info(`Qdrant collection "${collectionName}" already exists.`);
    return;
  }

  await qdrantClient.createCollection(collectionName, {
    vectors: {
      size: config.voyage.dimension,
      distance: 'Cosine',
    },
  });

  // eslint-disable-next-line no-console
  console.info(
    `Qdrant collection "${collectionName}" created (size=${config.voyage.dimension}, distance=Cosine).`,
  );
}
