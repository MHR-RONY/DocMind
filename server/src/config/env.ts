import 'dotenv/config';
import { z } from 'zod';

/**
 * Centralized, validated application configuration.
 *
 * All environment variables are validated at startup with Zod. If any
 * required variable is missing or malformed, the process logs the offending
 * field names (NEVER their values) and exits with a non-zero status so the
 * server fails fast rather than running in a half-configured state.
 */

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  CLIENT_ORIGIN: z.string().min(1, 'CLIENT_ORIGIN is required'),

  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_ACCESS_EXPIRY: z.string().min(1, 'JWT_ACCESS_EXPIRY is required'),
  JWT_REFRESH_EXPIRY: z.string().min(1, 'JWT_REFRESH_EXPIRY is required'),

  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(20),

  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  LLM_MODEL: z.string().min(1, 'LLM_MODEL is required'),
  LLM_MAX_TOKENS: z.coerce.number().int().positive(),

  VOYAGE_API_KEY: z.string().min(1, 'VOYAGE_API_KEY is required'),
  EMBEDDING_MODEL: z.string().min(1, 'EMBEDDING_MODEL is required'),
  EMBEDDING_DIMENSION: z.coerce.number().int().positive(),

  QDRANT_URL: z.string().url('QDRANT_URL must be a valid URL'),
  // Optional: local Qdrant needs no key. An empty env value (QDRANT_API_KEY=)
  // is treated as absent rather than an invalid empty string.
  QDRANT_API_KEY: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.string().min(1).optional(),
  ),
  QDRANT_COLLECTION_NAME: z
    .string()
    .min(1, 'QDRANT_COLLECTION_NAME is required'),

  // OAuth (optional). Endpoints return a clear 503 if their provider is unset,
  // so the server still boots in environments without social login configured.
  GOOGLE_CLIENT_ID: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.string().min(1).optional(),
  ),
  APPLE_CLIENT_ID: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.string().min(1).optional(),
  ),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive(),
  RATE_LIMIT_MAX: z.coerce.number().int().positive(),

  CHAT_HISTORY_LIMIT: z.coerce.number().int().positive(),
  RAG_TOP_K: z.coerce.number().int().positive(),
});

type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // Log only the field paths and messages — never the values, which may
    // contain secrets.
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');

    // eslint-disable-next-line no-console
    console.error(
      `❌ Invalid environment configuration. Fix the following and restart:\n${issues}`,
    );
    process.exit(1);
  }

  return parsed.data;
}

const env = loadEnv();

export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  clientOrigin: env.CLIENT_ORIGIN,
  mongoUri: env.MONGO_URI,
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiry: env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },
  bcryptRounds: env.BCRYPT_ROUNDS,
  anthropic: {
    apiKey: env.ANTHROPIC_API_KEY,
    model: env.LLM_MODEL,
    maxTokens: env.LLM_MAX_TOKENS,
  },
  voyage: {
    apiKey: env.VOYAGE_API_KEY,
    model: env.EMBEDDING_MODEL,
    dimension: env.EMBEDDING_DIMENSION,
  },
  qdrant: {
    url: env.QDRANT_URL,
    apiKey: env.QDRANT_API_KEY,
    collectionName: env.QDRANT_COLLECTION_NAME,
  },
  oauth: {
    googleClientId: env.GOOGLE_CLIENT_ID,
    appleClientId: env.APPLE_CLIENT_ID,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  },
  chatHistoryLimit: env.CHAT_HISTORY_LIMIT,
  ragTopK: env.RAG_TOP_K,
} as const;

export type AppConfig = typeof config;
