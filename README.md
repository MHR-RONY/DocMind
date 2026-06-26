<div align="center">

# DocMind

**A production-grade RAG chat system that turns your documents into a conversational knowledge base.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A520-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20DB-DC244C?logo=qdrant&logoColor=white)](https://qdrant.tech)
[![Anthropic Claude](https://img.shields.io/badge/Anthropic-Claude-D97757?logo=anthropic&logoColor=white)](https://www.anthropic.com)
[![Voyage AI](https://img.shields.io/badge/Voyage%20AI-Embeddings-5A4FCF)](https://www.voyageai.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![pnpm](https://img.shields.io/badge/pnpm-Workspace-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Built by [Mhrrony](https://mhrrony.com)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [SSE Streaming](#sse-streaming)
- [Security](#security)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Overview

**DocMind** is a Retrieval-Augmented Generation (RAG) chat platform. It ingests your documents, embeds them into a vector store, and lets users ask natural-language questions that are answered by a large language model grounded in the retrieved context — with source citations and real-time streamed responses.

**The problem it solves.** General-purpose chat models cannot answer questions about your private documents and tend to hallucinate when pushed beyond their training data. DocMind closes that gap: it retrieves the most relevant passages from your own corpus and constrains the model to answer from that context, so responses stay accurate, current, and traceable to a source.

**Who it is for.** Teams that need a private, self-hostable knowledge assistant over their own PDFs, Word documents, and text files — internal documentation, research libraries, support knowledge bases, or any collection that benefits from conversational search.

**Key highlights.**

- Document ingestion pipeline: parse → chunk → embed → vector store, with async processing status.
- Grounded answers via top-K semantic retrieval, streamed token-by-token over SSE.
- JWT authentication with rotating refresh tokens and role-based access control.
- An admin surface for managing documents, users, and platform statistics.
- A strict, fully-typed TypeScript backend with security enforced at every layer.

---

## Features

| User Features | Admin Features |
|---|---|
| Conversational chat interface with a focused, distraction-free composer | Dashboard with KPI cards and conversation-trend charts |
| Real-time streamed assistant responses with a live typing indicator | Document management — view type, size, chunk count, and processing status |
| Chat session history with search | Document upload with drag-and-drop and a pipeline progress view |
| New-chat suggestions and quick-start prompts | User management — roles, status, and block/unblock controls |
| Settings: profile, notification preferences, and theme (light / dark / auto) | Knowledge base view of collections and indexed documents |
| Pricing and upgrade page with plan comparison | Analytics — query volume, traffic sources, peak hours, satisfaction |
| Email-based registration and login | Embeddings and vector-collection overview |
| Responsive layouts for mobile and desktop | Platform statistics: total users, documents, messages, and token usage |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI library |
| TypeScript | 5.8.3 | Type system |
| Vite | 5.4.19 | Build tool / dev server (`@vitejs/plugin-react-swc`) |
| React Router DOM | 6.30.1 | Client-side routing |
| TanStack React Query | 5.83.0 | Server-state management |
| Tailwind CSS | 3.4.17 | Utility-first styling (`tailwindcss-animate`) |
| Radix UI + shadcn/ui | — | Accessible component primitives |
| React Hook Form | 7.61.1 | Form state |
| Zod | 3.25.76 | Schema validation |
| Recharts | 2.15.4 | Charts and data visualization |
| Lucide React | 0.462.0 | Icon set |
| Sonner | 1.7.4 | Toast notifications |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥ 20 | Runtime |
| Express | 4.21.2 | HTTP framework |
| TypeScript | 5.7.3 | Type system (strict mode) |
| Mongoose | 8.9.5 | MongoDB ODM |
| @qdrant/js-client-rest | 1.13.0 | Vector store client |
| @anthropic-ai/sdk | 0.32.1 | Claude LLM client |
| jsonwebtoken | 9.0.2 | JWT auth |
| bcrypt | 5.1.1 | Password hashing |
| Zod | 3.24.1 | Request validation |
| Multer | 1.4.5-lts.1 | File upload handling (memory storage) |
| pdf-parse | 1.1.1 | PDF text extraction |
| mammoth | 1.9.0 | DOCX text extraction |
| helmet | 8.0.0 | Secure HTTP headers |
| express-rate-limit | 7.5.0 | Rate limiting |
| cors / cookie-parser | 2.8.5 / 1.4.7 | CORS and cookie parsing |

### DevOps & Tools

| Technology | Version | Purpose |
|---|---|---|
| pnpm | — | Package manager (workspace-isolated frontend and backend) |
| Vitest | 3.2.4 | Unit testing (jsdom) |
| Playwright | 1.57.0 | End-to-end testing |
| ESLint | 9.32.0 | Linting (flat config) |
| tsx | 4.19.2 | TypeScript execution / watch mode |
| Qdrant | — | Vector database (Docker) |
| MongoDB | — | Primary datastore |

---

## Architecture

```
                                  ┌─────────────────────────┐
                                  │         Browser          │
                                  │  React + Vite (port 8080)│
                                  └───────────┬─────────────┘
                                              │  HTTPS / SSE
                                              │  Bearer access token
                                              ▼
                                  ┌─────────────────────────┐
                                  │    Express Backend       │
                                  │      (port 4000)         │
                                  │ helmet · CORS · JWT auth  │
                                  │ rate limits · validation  │
                                  └───┬───────────┬───────┬──┘
                                      │           │       │
                ┌─────────────────────┘           │       └────────────────────┐
                ▼                                  ▼                            ▼
      ┌──────────────────┐            ┌────────────────────┐       ┌────────────────────┐
      │     MongoDB      │            │       Qdrant        │       │  Anthropic Claude   │
      │ users · sessions │            │  chunk embeddings   │       │  streamed answers   │
      │ messages · docs  │            │  similarity search  │       │  (claude-sonnet-4-6)│
      └──────────────────┘            └────────▲──────────┘       └────────────────────┘
                                                │
                                      ┌─────────┴──────────┐
                                      │      Voyage AI      │
                                      │   text embeddings   │
                                      │     (voyage-3)      │
                                      └────────────────────┘
```

### RAG Pipeline

**Ingestion** (admin upload → searchable vectors):

1. **Upload** — a single file is received into memory (Multer `memoryStorage`).
2. **Validate** — magic bytes are checked before parsing (PDF `25 50 44 46`, DOCX `50 4B 03 04`, TXT UTF-8 / null-byte check). A `Document` record is created with status `processing` and the request returns `202` immediately.
3. **Parse** — text is extracted asynchronously: `pdf-parse` (PDF), `mammoth` (DOCX), or UTF-8 decode (TXT).
4. **Chunk** — text is split into overlapping chunks (size 1000, overlap 200).
5. **Embed** — chunks are embedded in batch via Voyage AI (`voyage-3`).
6. **Store** — vectors are upserted into Qdrant with `{ documentId, chunkIndex, text, originalName }` payloads; the `Document` is updated to `ready` with its chunk count, or `failed` on error.

**Query** (user message → grounded, streamed answer):

1. **Authenticate & validate** — the session is ownership-checked and the message is sanitized (HTML stripped, max 4000 chars).
2. **Persist** — the user message is saved to MongoDB.
3. **Embed** — the query is embedded via Voyage AI.
4. **Retrieve** — Qdrant returns the top `RAG_TOP_K` (default 5) most similar chunks.
5. **Assemble context** — retrieved chunks are formatted as numbered, attributed sources.
6. **Build prompt** — a fixed server-side system prompt + context + the last `CHAT_HISTORY_LIMIT` (default 10) messages + the new user message.
7. **Stream** — Claude streams the answer token-by-token over SSE; the full reply, token usage, and source citations are persisted only after the stream completes.

---

## Project Structure

```
DocMind/
├── public/                     # Static assets (favicon, placeholder, robots.txt)
├── src/                        # Frontend application
│   ├── components/             # Custom components (sidebars, chat input/message)
│   │   └── ui/                 # shadcn/ui + Radix primitives
│   ├── pages/                  # User-facing pages (chat, settings, auth, pricing)
│   │   └── admin/              # Admin panel pages (dashboard, documents, users…)
│   ├── layouts/                # Route-level layout wrappers (AdminLayout)
│   ├── hooks/                  # Reusable hooks (theme, mobile, toast)
│   ├── lib/                    # Shared utilities (cn class merger)
│   ├── App.tsx                 # Route definitions and providers
│   └── main.tsx                # Application entry point
│
├── server/                     # Backend application
│   ├── src/
│   │   ├── config/             # Env validation + MongoDB, Qdrant, Anthropic, Voyage clients
│   │   ├── models/             # Mongoose models (User, Document, ChatSession, Message)
│   │   ├── controllers/        # HTTP layer — call one service, return ApiResponse
│   │   ├── services/           # Business logic (auth, document, rag, chat, stream, admin…)
│   │   ├── routes/             # Route definitions (middleware + controller wiring)
│   │   ├── middleware/         # auth, requireRole, rate limiters, validate, upload, errors
│   │   ├── validators/         # Zod schemas per request body
│   │   ├── utils/              # ApiResponse, ApiError, tokens, sanitize, chunker, magicBytes
│   │   ├── types/              # Shared interfaces and enums
│   │   ├── app.ts              # Express app assembly
│   │   └── server.ts           # Bootstrap: validate env → connect DB → ensure Qdrant → listen
│   ├── .env.example            # Environment variable template
│   └── package.json            # Backend dependencies and scripts
│
├── index.html                  # HTML entry
├── vite.config.ts              # Vite config (port 8080, @ → ./src alias)
├── tailwind.config.ts          # Tailwind theme and tokens
└── package.json                # Frontend dependencies and scripts
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** (the only supported package manager)
- A running **MongoDB** instance
- A running **Qdrant** instance
- **Anthropic** and **Voyage AI** API keys

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/MHR-RONY/DocMind.git
cd DocMind
```

**2. Install frontend dependencies**

```bash
pnpm install
```

**3. Install backend dependencies**

```bash
cd server && pnpm install
```

**4. Configure environment variables**

```bash
cp server/.env.example server/.env
# then edit server/.env with your real values
```

**5. Start Qdrant** (via Docker)

```bash
docker run -p 6333:6333 qdrant/qdrant
```

**6. Run the frontend** (from the project root)

```bash
pnpm run dev
```

The frontend starts on [http://localhost:8080](http://localhost:8080).

**7. Run the backend** (in a separate terminal)

```bash
cd server && pnpm run dev
```

The API starts on [http://localhost:4000](http://localhost:4000). On boot it validates the environment, connects to MongoDB, and creates the Qdrant collection if it does not exist.

---

## Environment Variables

All backend variables are validated at startup — the server crashes fast if any required value is missing or malformed. `QDRANT_API_KEY` is the only optional variable (leave empty for local Qdrant).

| Variable | Description | Example |
|---|---|---|
| `PORT` | HTTP port the Express server listens on | `4000` |
| `NODE_ENV` | Runtime mode (`development` / `production` / `test`) | `development` |
| `CLIENT_ORIGIN` | Allowed CORS origin (no wildcard in production) | `http://localhost:8080` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/docmind` |
| `JWT_ACCESS_SECRET` | Signing secret for the short-lived access token | `change-me-access-secret` |
| `JWT_REFRESH_SECRET` | Signing secret for the rotating refresh token | `change-me-refresh-secret` |
| `JWT_ACCESS_EXPIRY` | Access-token lifetime | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh-token lifetime | `7d` |
| `BCRYPT_ROUNDS` | bcrypt cost factor for password hashing | `12` |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key (server-only) | `sk-ant-xxxxxxxx` |
| `LLM_MODEL` | Claude model id | `claude-sonnet-4-6` |
| `LLM_MAX_TOKENS` | Max output tokens per reply | `4096` |
| `VOYAGE_API_KEY` | Voyage AI API key (server-only) | `pa-xxxxxxxx` |
| `EMBEDDING_MODEL` | Embedding model name | `voyage-3` |
| `EMBEDDING_DIMENSION` | Vector dimension (must match the Qdrant collection) | `1024` |
| `QDRANT_URL` | Qdrant base URL | `http://localhost:6333` |
| `QDRANT_API_KEY` | Qdrant API key (optional; empty for local) | |
| `QDRANT_COLLECTION_NAME` | Collection storing chunk vectors | `docmind_chunks` |
| `RATE_LIMIT_WINDOW_MS` | General rate-limit window in milliseconds | `900000` |
| `RATE_LIMIT_MAX` | Max requests per IP per window | `500` |
| `CHAT_HISTORY_LIMIT` | Messages of history included in each prompt | `10` |
| `RAG_TOP_K` | Chunks retrieved from Qdrant per query | `5` |

---

## API Reference

Base path: `/api`. All responses use the envelope `{ success, message, data, pagination? }` (or `{ success: false, message, errors? }`), except the chat message endpoint, which streams Server-Sent Events.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create a user, set the refresh cookie, return an access token |
| `POST` | `/api/auth/login` | Public | Authenticate, rotate the refresh token, return an access token |
| `POST` | `/api/auth/refresh` | Cookie | Rotate the refresh token from the httpOnly cookie |
| `POST` | `/api/auth/logout` | Authenticated | Clear the stored refresh token and cookie |
| `GET` | `/api/auth/me` | Authenticated | Return the current user's safe profile |
| `POST` | `/api/auth/forgot-password` | Public | Request a password reset (always returns 200) |
| `POST` | `/api/auth/reset-password` | Public | Verify the reset token and set a new password |
| `GET` | `/api/chat/sessions` | Authenticated | List the user's chat sessions, newest first |
| `POST` | `/api/chat/sessions` | Authenticated | Create a new chat session |
| `GET` | `/api/chat/sessions/:id` | Authenticated | Get an owned session with its messages |
| `DELETE` | `/api/chat/sessions/:id` | Authenticated | Delete a session and cascade its messages |
| `POST` | `/api/chat/sessions/:id/messages` | Authenticated | Send a message and stream the answer over **SSE** |
| `GET` | `/api/documents` | Authenticated | Paginated list of documents |
| `POST` | `/api/documents/upload` | Admin | Upload a single file (returns 202, async processing) |
| `DELETE` | `/api/documents/:id` | Admin | Delete a document and its vectors |
| `GET` | `/api/admin/users` | Admin | Paginated list of users |
| `PATCH` | `/api/admin/users/:id/block` | Admin | Block or unblock a user |
| `GET` | `/api/admin/stats` | Admin | Platform counts and total token usage |

---

## SSE Streaming

The chat message endpoint (`POST /api/chat/sessions/:id/messages`) responds with `Content-Type: text/event-stream` and the headers `Cache-Control: no-cache`, `Connection: keep-alive`, and `X-Accel-Buffering: no`. The assistant reply is streamed as discrete events, each on its own `data:` line.

**Token delta** — emitted for each chunk of generated text:

```
data: {"type":"delta","content":"..."}
```

**Completion** — emitted once when the stream finishes, carrying token usage and source citations:

```
data: {"type":"done","tokenUsage":{"inputTokens":0,"outputTokens":0},"sourceDocs":[]}
```

**Error** — emitted if generation fails; raw upstream errors are never exposed:

```
data: {"type":"error","message":"Something went wrong"}
```

The full assistant message, its token usage, and source documents are persisted to MongoDB **only after** the stream completes successfully. If the client disconnects mid-stream, the upstream Anthropic request is aborted and no partial message is saved.

---

## Security

Every control below is enforced in code:

- **Authentication** — JWT access token (Bearer header, 15-minute lifetime) paired with a refresh token stored **only** in an httpOnly, `sameSite=strict` cookie scoped to `/api/auth`.
- **Refresh-token rotation & reuse detection** — every register, login, and refresh issues a new token pair; a presented token that does not match the stored value is rejected.
- **Role-based access control** — `authenticate` attaches the verified user; `requireRole` gates admin-only routes. Blocked accounts are denied at login.
- **Password hashing** — bcrypt with a configurable cost factor; `password` and `refreshToken` use `select: false` and are never returned.
- **Rate limiting** — auth `10 / 15 min` per IP, chat `30 / min` per user, upload `5 / 10 min` per user, and a general `500 / 15 min` per IP limit.
- **NoSQL injection defense** — `$`-prefixed and dotted keys are recursively stripped from every request body, params, and query before validation.
- **Input validation** — every request body is validated with Zod; ObjectIds are validated before any database query.
- **File-upload safety** — memory storage only, a 10 MB / single-file limit, a MIME allowlist, and magic-byte validation before any parsing.
- **Prompt-injection guard** — a fixed server-side system prompt; user input only ever enters the conversation as message turns and can never override instructions.
- **Hardened HTTP** — `helmet` on all routes and an explicit CORS origin with credentials (no wildcards).
- **Safe error handling** — stack traces and internal messages are suppressed in production; raw Anthropic errors are never streamed to clients.
- **Secret hygiene** — API keys live only in `process.env`, are never logged, never returned, and never accepted from the client; environment variables are validated at startup.

---

## Roadmap

- [ ] Wire the frontend to the live backend API (replace mock data and simulated streaming)
- [ ] Source-citation rendering beneath assistant messages
- [ ] Document re-indexing and chunk-level inspection
- [ ] Multi-file and folder uploads
- [ ] Conversation export (Markdown / PDF)
- [ ] Workspace and team collaboration support
- [ ] Configurable retrieval parameters per workspace
- [ ] Usage analytics and per-user token budgets
- [ ] Docker Compose for one-command local setup
- [ ] CI pipeline with automated tests and type checks

---

## Contributing

Contributions are welcome.

1. **Fork** the repository.
2. **Create a branch** for your work: `git checkout -b feat/your-feature`.
3. **Commit** using [Conventional Commits](https://www.conventionalcommits.org): `type: brief description` (e.g. `feat: add citation rendering`).
4. **Open a pull request** against the `developer` branch with a clear summary of your changes.

Please keep the backend fully typed (no `any`), validate every request body with Zod, and never commit secrets or non-pnpm lockfiles.

---

## License

Released under the **MIT License**. Copyright © 2025 Mhrrony.

---

## Author

**Mhrrony**

- Website: [https://mhrrony.com](https://mhrrony.com)
- GitHub: [https://github.com/MHR-RONY](https://github.com/MHR-RONY)
