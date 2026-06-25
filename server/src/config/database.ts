import mongoose from 'mongoose';
import { config } from './env';

/**
 * Connects to MongoDB using the validated `config.mongoUri`.
 *
 * Implements bounded retry-with-delay on initial connection failure so the
 * server can tolerate a database that is still starting up (e.g. in
 * docker-compose). The connection string is never logged — it may contain
 * credentials — only sanitized status messages are emitted.
 */

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function registerConnectionListeners(): void {
  const connection = mongoose.connection;

  connection.on('error', (err: Error) => {
    // eslint-disable-next-line no-console
    console.error(`MongoDB connection error: ${err.message}`);
  });

  connection.on('disconnected', () => {
    // eslint-disable-next-line no-console
    console.warn('MongoDB disconnected.');
  });

  connection.on('reconnected', () => {
    // eslint-disable-next-line no-console
    console.info('MongoDB reconnected.');
  });
}

export async function connectDatabase(): Promise<void> {
  registerConnectionListeners();

  // Avoid buffering model operations while disconnected; surface errors fast.
  mongoose.set('strictQuery', true);

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await mongoose.connect(config.mongoUri);
      // eslint-disable-next-line no-console
      console.info('MongoDB connected successfully.');
      return;
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : 'unknown error';
      // eslint-disable-next-line no-console
      console.error(
        `MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${message}`,
      );

      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS);
      }
    }
  }

  const finalMessage =
    lastError instanceof Error ? lastError.message : 'unknown error';
  throw new Error(
    `Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${finalMessage}`,
  );
}
