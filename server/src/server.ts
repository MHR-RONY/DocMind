import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import { ensureCollection } from './config/qdrant';

/* eslint-disable no-console */

const start = async (): Promise<void> => {
  try {
    // Importing ./config/env has already validated env vars (crash-fast on failure).
    await connectDatabase();
    await ensureCollection();

    const server = app.listen(config.port, () => {
      console.log(`[server] DocMind API listening on port ${config.port} (${config.nodeEnv})`);
    });

    const shutdown = (signal: string): void => {
      console.log(`[server] ${signal} received, shutting down gracefully`);
      server.close(() => {
        console.log('[server] HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[server] Fatal startup error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

void start();
