# DocMind — Backend (RAG Chat API)

Production RAG chat backend: JWT auth, document ingestion (parse → chunk → embed → Qdrant), and SSE-streamed chat answers grounded in retrieved context via Anthropic Claude.

## Stack

- **Runtime:** Node.js + Express + TypeScript (strict)
- **Database:** MongoDB (Mongoose) — users, sessions, messages, document metadata
- **Vector store:** Qdrant — chunk embeddings + similarity search
- **Embeddings:** Voyage AI (`voyage-3`)
- **LLM:** Anthropic Claude (`claude-sonnet-4-6`), streamed over SSE
- **Parsing:** `pdf-parse` (PDF) · `mammoth` (DOCX) · UTF-8 (TXT)
- **Package manager:** pnpm only

## Prerequisites

- Node.js >= 20
- pnpm
- A running MongoDB instance
- A running Qdrant instance (local needs no API key)
- Anthropic and Voyage AI API keys

## Setup

```bash
cd server
pnpm install          # isolated from the frontend workspace; compiles bcrypt
cp .env.example .env  # then fill in real values
```

## Environment variables

All variables are validated at startup (`src/config/env.ts`) — the server **crashes fast** if any required value is missing or malformed. `QDRANT_API_KEY` is the only optional one (leave empty for local Qdrant).

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default 4000) |
| `NODE_ENV` | `development` \| `production` \| `test` |
| `CLIENT_ORIGIN` | Allowed CORS origin (the Vite dev server, e.g. `http://localhost:8080`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | JWT signing secrets |
| `JWT_ACCESS_EXPIRY` / `JWT_REFRESH_EXPIRY` | Token lifetimes (e.g. `15m`, `7d`) |
| `BCRYPT_ROUNDS` | bcrypt cost factor |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `LLM_MODEL` | Claude model id (`claude-sonnet-4-6`) |
| `LLM_MAX_TOKENS` | Max output tokens per reply |
| `VOYAGE_API_KEY` | Voyage AI API key |
| `EMBEDDING_MODEL` | Embedding model (`voyage-3`) |
| `EMBEDDING_DIMENSION` | Vector dimension (e.g. 1024) |
| `QDRANT_URL` | Qdrant base URL |
| `QDRANT_API_KEY` | Qdrant API key (optional; empty for local) |
| `QDRANT_COLLECTION_NAME` | Collection for chunk vectors |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | General per-IP rate limit |
| `CHAT_HISTORY_LIMIT` | Messages of history included in each prompt |
| `RAG_TOP_K` | Chunks retrieved per query |

## Commands

```bash
pnpm dev        # start in watch mode (tsx)
pnpm build      # compile to dist/
pnpm start      # run compiled dist/server.js
pnpm typecheck  # tsc --noEmit
```

On boot the server validates env, connects MongoDB, and ensures the Qdrant collection exists (creating it with the configured dimension and cosine distance if missing).

## Project structure

```
server/src/
  config/       # env validation, db, qdrant, anthropic, voyage clients
  controllers/  # HTTP layer — call one service, return ApiResponse
  services/     # business logic: DB, Qdrant, Anthropic, Voyage
  models/       # Mongoose models
  routes/       # middleware + controller wiring
  middleware/   # authenticate, requireRole, rate limiters, validate, upload, errorHandler
  validators/   # Zod schemas per request body
  utils/        # ApiResponse, ApiError, catchAsync, tokens, sanitize, chunker, magicBytes
  types/        # shared interfaces and enums
  app.ts        # Express assembly
  server.ts     # bootstrap
```

## API routes

Base path `/api`. All responses use the envelope `{ success, message, data, pagination? }` (or `{ success: false, message, errors? }`), except the chat message endpoint which streams Server-Sent Events.

| Route | Method | Access |
|---|---|---|
| `/auth/register` | POST | Public |
| `/auth/login` | POST | Public |
| `/auth/refresh` | POST | Cookie |
| `/auth/logout` | POST | Auth |
| `/auth/me` | GET | Auth |
| `/auth/forgot-password` | POST | Public |
| `/auth/reset-password` | POST | Public |
| `/chat/sessions` | GET / POST | Auth |
| `/chat/sessions/:id` | GET / DELETE | Auth |
| `/chat/sessions/:id/messages` | POST | Auth (SSE) |
| `/documents` | GET | Auth |
| `/documents/upload` | POST | Admin |
| `/documents/:id` | DELETE | Admin |
| `/admin/users` | GET | Admin |
| `/admin/users/:id/block` | PATCH | Admin |
| `/admin/stats` | GET | Admin |

### Chat streaming (SSE)

`POST /api/chat/sessions/:id/messages` streams the assistant reply as `text/event-stream`:

```
data: {"type":"delta","content":"..."}

data: {"type":"done","tokenUsage":{"inputTokens":0,"outputTokens":0},"sourceDocs":[]}
```

On error a single `data: {"type":"error","message":"..."}` frame is sent and the stream closes. The assembled reply is persisted only after the stream completes; a client disconnect aborts the upstream Anthropic call.

## Security

- JWT access token (Bearer header) + rotating refresh token (httpOnly cookie only).
- `helmet`, explicit CORS origin, per-route rate limiting (auth/chat/upload/general).
- All request bodies validated with Zod; `$`-prefixed keys stripped (NoSQL injection guard); ObjectIds validated before queries.
- Uploads: memory storage only, 10 MB / 1 file, magic-byte validated before parsing.
- Secrets read from `process.env` only — never logged, never returned, never accepted from the client.
