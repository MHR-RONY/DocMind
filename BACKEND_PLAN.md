# DocMind — Backend Implementation Plan

> Derived from the full frontend scan (`PROJECT_ANALYSIS.md`) and the authoritative spec in `CLAUDE.md`. Where the frontend mocks diverge from `CLAUDE.md`, **`CLAUDE.md` wins** and the divergence is flagged in §9.

---

## 1. Backend Overview

The backend is a **production-grade RAG chat API** that the (currently mock-only) frontend will consume. It must:

- Authenticate users (JWT access + rotating refresh) and enforce `user`/`admin` roles.
- Manage chat sessions and messages, with a server-side RAG pipeline that retrieves document context and calls Claude.
- Ingest documents (admin upload → parse → chunk → embed → vector store) and expose document management.
- Serve admin dashboards (users, stats).

### Stack

| Concern | Technology |
|---------|-----------|
| Runtime | Node.js + Express + TypeScript |
| Package manager | **pnpm only** (commit `pnpm-lock.yaml`) |
| Database | MongoDB via Mongoose — users, sessions, messages, document metadata |
| Vector store | Qdrant — embeddings + similarity search |
| Embeddings | Voyage AI `voyage-3` |
| LLM | Anthropic Claude `claude-sonnet-4-6` |
| File parsing | `pdf-parse` (PDF), `mammoth` (DOCX), plain text (TXT) |
| File handling | `multer` `memoryStorage()` — never write to disk |
| Validation | Zod on every request body |
| Security | `helmet`, `cors`, `express-rate-limit`, `cookie-parser`, `bcrypt`, `jsonwebtoken` |

### Folder Structure (per `CLAUDE.md`)

```
server/src/
  config/       # db.ts, qdrant.ts, anthropic.ts, voyage.ts, env.ts
  controllers/  # HTTP layer only — call service, return ApiResponse
  services/     # All business logic: DB, Qdrant, Anthropic, Voyage
  models/       # Mongoose models
  routes/       # Middleware + controller wiring only
  middleware/   # authenticate, requireRole, rateLimiters, errorHandler, upload
  validators/   # Zod schemas per request body
  utils/        # ApiResponse, ApiError, catchAsync, tokenUtils, chunker
  types/        # Shared interfaces + enums
  app.ts        # Express app assembly (helmet, cors, parsers, routes, errorHandler)
  server.ts     # Bootstrap: validate env → connect DB → ensure Qdrant → listen
```

**Architecture rules (enforced):** routes = middleware + controller only; controllers call exactly one service and return `ApiResponse`, wrapped in `catchAsync()` (no raw try/catch, no DB/LLM calls); services hold all logic. Always `ApiResponse`/`ApiError`, never raw `res.json()`.

---

## 2. Environment Variables Required

### Frontend VITE_ → backend mapping

The frontend currently references **no** `VITE_*` vars. When wired, it needs exactly one to reach the backend:

| Frontend var (to add) | Backend equivalent | Notes |
|-----------------------|--------------------|-------|
| `VITE_API_URL` | `PORT` + `CLIENT_ORIGIN` | FE base URL → BE; BE must allow this origin via `CLIENT_ORIGIN` for CORS + cookies (`credentials: include`). |

There is no other frontend→backend env coupling — all secrets (Anthropic, Voyage, Qdrant, JWT) live **server-side only** and are never sent to or accepted from the client.

### `.env.example` (backend)

```dotenv
# Server
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:8080          # Vite dev server origin

# Database
MONGO_URI=mongodb://localhost:27017/docmind

# Auth / JWT
JWT_ACCESS_SECRET=change-me-access
JWT_REFRESH_SECRET=change-me-refresh
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BCRYPT_ROUNDS=12

# Anthropic (LLM)
ANTHROPIC_API_KEY=sk-ant-...
LLM_MODEL=claude-sonnet-4-6
LLM_MAX_TOKENS=4096

# Voyage AI (embeddings)
VOYAGE_API_KEY=pa-...
EMBEDDING_MODEL=voyage-3
EMBEDDING_DIMENSION=1024

# Qdrant (vector store)
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION_NAME=docmind_chunks

# Rate limiting & RAG tuning
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=500
CHAT_HISTORY_LIMIT=10
RAG_TOP_K=5
```

All required vars are validated at startup with a Zod schema in `config/env.ts` — **crash fast** if any are missing. `ANTHROPIC_API_KEY` / `VOYAGE_API_KEY` / `QDRANT_API_KEY` are never logged or returned.

---

## 3. Database Models

Models follow `CLAUDE.md` exactly. The frontend mocks add fields (`moderator` role, tri-state status, extra file types) that are **intentionally dropped** — see §9.

### `User`

| Field | Type | Notes |
|-------|------|-------|
| `name` | `string` | required |
| `email` | `string` | required, unique, lowercase, indexed |
| `password` | `string` | bcrypt hash, `select: false` |
| `role` | `"user" \| "admin"` | default `"user"` |
| `isBlocked` | `boolean` | default `false` |
| `refreshToken` | `string` | `select: false`, rotated on refresh |
| `timestamps` | — | `createdAt`/`updatedAt` |

Never return `password` or `refreshToken` — query with `.select('-password -refreshToken')`.

### `Document`

| Field | Type | Notes |
|-------|------|-------|
| `filename` | `string` | stored/generated name |
| `originalName` | `string` | as uploaded |
| `fileType` | `"pdf" \| "docx" \| "txt"` | enum |
| `fileSize` | `number` | bytes |
| `uploadedBy` | `ObjectId → User` | ref |
| `chunkCount` | `number` | default `0` |
| `status` | `"processing" \| "ready" \| "failed"` | default `"processing"` |
| `timestamps` | — | |

### `ChatSession`

| Field | Type | Notes |
|-------|------|-------|
| `userId` | `ObjectId → User` | ref, indexed |
| `title` | `string` | derived from first message |
| `isActive` | `boolean` | default `true` |
| `timestamps` | — | `updatedAt` powers FE relative time |

### `Message`

| Field | Type | Notes |
|-------|------|-------|
| `sessionId` | `ObjectId → ChatSession` | ref, indexed |
| `role` | `"user" \| "assistant"` | enum |
| `content` | `string` | sanitized, max 4000 |
| `tokenUsage` | `{ input: number; output: number }` | optional |
| `sourceDocs` | `[{ documentId, originalName, score }]` | citations (FE rendering TBD) |
| `timestamps` | — | |

### Relationships

```
User 1──* ChatSession 1──* Message
User 1──* Document
Document 1──* (Qdrant points, keyed by documentId in payload)
Message *──* Document   (via sourceDocs citations)
```

---

## 4. API Endpoints — Full Specification

All responses use the envelope:
```json
{ "success": true,  "message": "...", "data": {}, "pagination": {} }
{ "success": false, "message": "...", "errors": [{ "field": "", "message": "" }] }
```

### Auth

**`POST /api/auth/register`** — Public · rate-limited (10/15min/IP)
- Body: `{ name: string, email: string(email), password: string(min 8) }`
- 201 `data`: `{ user: {id,name,email,role}, accessToken }` + sets httpOnly `refreshToken` cookie
- Errors: 409 email exists; 400 validation

**`POST /api/auth/login`** — Public · rate-limited
- Body: `{ email, password }`
- 200 `data`: `{ user, accessToken }` + refresh cookie
- Errors: 401 bad credentials; 403 blocked

**`POST /api/auth/refresh`** — Cookie-only
- Reads refresh cookie, verifies, **rotates** it, issues new access token
- 200 `data`: `{ accessToken }`
- Errors: 401 missing/invalid/reused token

**`POST /api/auth/logout`** — Auth
- Clears refresh cookie + nulls stored `refreshToken`
- 200 `data`: `{}`

**`GET /api/auth/me`** — Auth
- 200 `data`: `{ user: {id,name,email,role} }` → feeds FE sidebar/profile (replaces hardcoded "Mehraf")

### Chat

**`GET /api/chat/sessions`** — Auth
- 200 `data`: `ChatSession[]` `{ id, title, isActive, updatedAt }` → feeds `/chats` + sidebar Recents

**`POST /api/chat/sessions`** — Auth
- Body: `{ title?: string }`
- 201 `data`: `ChatSession`

**`GET /api/chat/sessions/:id`** — Auth (ownership-checked)
- 200 `data`: `{ session, messages: Message[] }`
- Errors: 404 not found; 403 not owner

**`DELETE /api/chat/sessions/:id`** — Auth (ownership-checked)
- 200 `data`: `{}`

**`POST /api/chat/sessions/:id/messages`** — Auth · rate-limited (30/min/user)
- Body: `{ content: string(max 4000) }`
- Runs RAG pipeline (§5). FE expects **streaming** + a stop control — recommend SSE/chunked transfer for the assistant reply, then persist.
- 200 `data`: `{ message: assistantMessage, sourceDocs[] }`
- Errors: 400 validation; 404 session; 502 upstream (LLM/embedding) — **never** stream raw Anthropic errors

### Documents

**`GET /api/documents`** — Auth
- 200 `data`: `Document[]` + `pagination`

**`POST /api/documents/upload`** — Admin · rate-limited (5/10min/user)
- `multipart/form-data`, **1 file, ≤10MB**, magic-byte validated (§7)
- 202 `data`: `Document` (status `processing`; async pipeline flips to `ready`/`failed`)
- Errors: 400 bad type/size/magic-bytes; 413 too large

**`DELETE /api/documents/:id`** — Admin
- Deletes Mongo record + Qdrant points for that `documentId`
- 200 `data`: `{}`

### Admin

**`GET /api/admin/users`** — Admin
- 200 `data`: `User[]` (sans password/refreshToken) + `pagination`

**`PATCH /api/admin/users/:id/block`** — Admin
- Body: `{ isBlocked: boolean }`
- 200 `data`: updated `User`

**`GET /api/admin/stats`** — Admin
- 200 `data`: `{ totals: {users, documents, sessions, messages}, series: {...} }` → feeds Dashboard KPIs/charts

> Admin screens **without** spec'd routes (Conversations, Analytics, KnowledgeBase, DataSources, Embeddings, Integrations, Labels, Notifications, Security, admin Settings) are **out of scope** for v1 — they remain mock-only on the FE until prioritized. See §9.

---

## 5. RAG Pipeline Plan

### Ingestion (on `POST /api/documents/upload`)

```
file (memory buffer)
  → magic-byte check (PDF 25504446 · DOCX 504B0304 · TXT charset)
  → parse to plain text (pdf-parse | mammoth | utf-8 decode)
  → chunk: 1000 tokens, 200 overlap
  → embed each chunk (Voyage AI voyage-3, dim 1024)
  → upsert to Qdrant with payload { documentId, chunkIndex, text, originalName }
  → update Document.chunkCount + status = "ready" (or "failed" on error)
```
Runs **async** after the 202 response so the request returns fast; status polled via `GET /api/documents`.

### Query (on `POST /api/chat/sessions/:id/messages`)

```
authenticate → sanitize message (strip HTML, max 4000, strip $-keys)
  → embed query (Voyage AI voyage-3)
  → Qdrant search (top RAG_TOP_K = 5 chunks)
  → build context block from retrieved chunks
  → construct prompt: [server system prompt] + [context] + [last CHAT_HISTORY_LIMIT=10 messages] + [user message]
  → call Claude (claude-sonnet-4-6, max LLM_MAX_TOKENS), stream to client
  → persist user + assistant Message (+ tokenUsage, + sourceDocs)
  → return answer + source refs
```

**Tuning constants** (all env-driven, never hardcoded): chunk 1000 / overlap 200; `RAG_TOP_K=5`; `CHAT_HISTORY_LIMIT=10`; `EMBEDDING_DIMENSION=1024`. The server system prompt is **always enforced** and never overridable by user input (prompt-injection guard).

---

## 6. Auth Flow Plan

- **Access token**: JWT, 15m, returned in body, sent by FE as `Authorization: Bearer`.
- **Refresh token**: JWT, 7d, **httpOnly + secure + sameSite cookie only** — never in response body. Stored (hashed or raw per policy) on the `User` and **rotated on every `/auth/refresh`**; reuse detection invalidates the session.
- **`authenticate` middleware**: verify Bearer access token → load user → attach `req.user`; reject blocked users.
- **`requireRole('admin')` middleware**: gate `/api/documents/upload`, `/api/documents/:id` DELETE, and all `/api/admin/*`.
- **FE wiring needed** (greenfield): an auth context storing the access token (memory, not localStorage), an HTTP wrapper that injects the Bearer header + uses `credentials: "include"`, a 401→refresh→retry interceptor, and **route guards** (currently `/admin/*` is wide open). Replace toast-only login/signup with real calls.

---

## 7. File Upload Plan

- **Multer**: `memoryStorage()` only (no disk), `limits.fileSize = 10MB`, `limits.files = 1`.
- **Allowed MIME**: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain` — but MIME is **not trusted alone**.
- **Magic-byte validation** (before any parsing):
  - PDF → `25 50 44 46` (`%PDF`)
  - DOCX → `50 4B 03 04` (`PK..` zip)
  - TXT → charset/UTF-8 validity check
- **Per-type parse**: PDF → `pdf-parse`; DOCX → `mammoth.extractRawText`; TXT → buffer `toString('utf-8')`. Then the shared chunk → embed → Qdrant-upsert pipeline (§5).
- Reject with 400 on type/size/magic-byte mismatch **before** touching the parser or LLM.

---

## 8. Implementation Order

| Phase | Scope | Depends on | Est. commits |
|-------|-------|-----------|--------------|
| **0. Scaffold** | `pnpm init`, TS strict config, Express app, folder structure, `helmet`/`cors`/`cookie-parser`, `env.ts` Zod validation, `ApiResponse`/`ApiError`/`catchAsync`, global `errorHandler` | — | 2–3 |
| **1. DB + models** | Mongo connection, `User`/`Document`/`ChatSession`/`Message` models, shared types/enums | 0 | 2 |
| **2. Auth** | bcrypt, JWT utils, register/login/refresh/logout/me, `authenticate` + `requireRole`, auth rate limiter, Zod auth validators | 1 | 3–4 |
| **3. Documents + ingestion** | Multer memory upload, magic-byte middleware, parsers, chunker, Voyage client, Qdrant client + collection bootstrap, upload/list/delete, async ingestion | 2 | 4–5 |
| **4. Chat + RAG query** | Session CRUD, message endpoint, query embedding, Qdrant search, prompt builder, Anthropic client, streaming response, persistence, chat rate limiter | 3 | 4–5 |
| **5. Admin** | `GET /admin/users`, `PATCH .../block`, `GET /admin/stats` | 2,4 | 2 |
| **6. Hardening + tests** | General rate limiter, input sanitization ($-key strip, ObjectId validation), integration tests per route group, `.env.example`, README | all | 3–4 |
| **7. FE integration** | `VITE_API_URL`, HTTP client + Bearer/refresh interceptor, auth context + route guards, replace mocks with react-query calls, source-doc rendering, reconcile upload UI to 10MB/3-types | all BE | (FE work) |

**Build dependency chain:** scaffold → models → auth (gates everything protected) → documents (RAG needs a corpus) → chat query (needs corpus + auth) → admin → hardening → FE wiring. Total backend: ~20–26 commits before FE integration.

---

## 9. Open Questions

### Frontend↔backend contract gaps to resolve before/while building

1. **Upload limits & types** — FE advertises **50MB + batch + PDF/DOCX/CSV/MD/TXT/HTML/JSON/images(OCR)**; spec is **10MB, 1 file, PDF/DOCX/TXT**. *Recommendation: build to spec; trim the Upload UI text and accepted-formats grid in Phase 7.*
2. **User roles** — FE mock has `moderator` + tri-state status (`active/inactive/suspended`); spec is `user|admin` + `isBlocked` boolean. *Recommendation: build to spec; the FE Users table maps `isBlocked` → a "suspended/active" badge, drop `moderator`.*
3. **Embedding provider** — FE Embeddings screen shows OpenAI/Cohere/Local; spec mandates **Voyage `voyage-3`**. *Recommendation: backend uses Voyage only; the Embeddings admin screen stays mock until a real model-management feature is scoped.*
4. **LLM model** — FE admin Settings lists GPT-5/Gemini/Llama; spec is **`claude-sonnet-4-6` only**. *Recommendation: ignore FE model picker; never hardcode an alternate model.*
5. **Streaming contract** — FE chat renders a blinking cursor and exposes a stop/cancel control, implying **streaming**. *Decision needed: SSE vs chunked transfer. The documented response is a JSON envelope — confirm whether the final persisted message is returned after the stream, or whether the FE assembles it from stream chunks.*
6. **Source citations** — `Message.sourceDocs` exists in the model but the **FE renders nothing for it yet**. *Phase 7 must add citation rendering under assistant messages.*
7. **Profile update** — FE Settings edits name/"call name"/preferences/notifications, but **no profile-update route exists** in the spec. *Decision needed: add `PATCH /api/auth/me` (or similar) or keep FE settings local-only for v1.*
8. **Pagination shape** — multiple admin/list screens show pagination ("Showing N of 12,847"). *Confirm the `pagination` envelope fields (`page`, `pageSize`, `total`, `totalPages`) so FE and BE agree.*
9. **Out-of-spec admin screens** — Conversations, Analytics, KnowledgeBase, DataSources, Integrations, Labels, Notifications, Security, admin Settings have **no backend routes**. *Recommendation: ship v1 with the spec'd routes only; these screens remain mock-only and are prioritized separately.*

### Recommendations before starting

- **Treat `CLAUDE.md` as the source of truth**; the FE mocks are aspirational UI, not contract.
- **Remove fake secrets from FE source** (`Integrations.tsx`, admin `Settings.tsx`, `DataSources.tsx`) before any real deploy.
- **Fix FE branding** ("Research AI" → DocMind) and remove dead code (`App.css`, `Placeholder.tsx`) during Phase 7.
- **Backend gets its own strict tsconfig** (`strict: true`, no `any`) — do not inherit the FE's loose config.
- **Confirm the streaming decision (#5) early** — it shapes the chat controller and the FE HTTP client design.
