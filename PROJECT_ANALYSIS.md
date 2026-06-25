# DocMind — Frontend Project Analysis

> Generated from a full parallel scan of the `src/` tree and all config files. This document describes the **current state** of the frontend exactly as it exists, including every gap, mock, and divergence from the production spec in `CLAUDE.md`.

---

## 1. Project Overview

**DocMind** is the frontend for a production-grade **RAG (Retrieval-Augmented Generation) chat system**. It presents two surfaces:

- **End-user chat app** — a Claude-style research chat UI (sidebar + streaming message thread), chat history, settings, and a pricing/upgrade page.
- **Admin panel** — a 15-screen dashboard for managing the RAG system: documents, knowledge base collections, embeddings, data sources, users, conversations, analytics, integrations, security, and workspace settings.

### Tech Stack (frontend, as-built)

| Layer | Technology |
|-------|-----------|
| Framework | React 18.3 + TypeScript 5.8 |
| Build tool | Vite 5.4 (SWC React plugin) |
| Routing | react-router-dom 6.30 |
| UI kit | shadcn/ui (50 components) over Radix UI primitives |
| Styling | Tailwind CSS 3.4 + `tailwindcss-animate`, CSS variables for theming |
| Server state | TanStack Query 5.83 (**installed, mounted, but never used**) |
| Forms | react-hook-form 7.61 + Zod 3.25 + `@hookform/resolvers` (**deps present, not wired**) |
| Charts | Recharts 2.15 |
| Toasts | Sonner 1.7 + Radix Toast |
| Icons | lucide-react |
| Theming | custom `useTheme` context (light/dark/auto, persisted to localStorage) |
| Unit tests | Vitest 3.2 + Testing Library + jsdom |
| E2E tests | Playwright 1.57 (**scaffold only, empty config**) |
| Package manager | pnpm (per `CLAUDE.md` — `pnpm-lock.yaml` only) |

### Maturity & Completeness Assessment

**UI layer: ~90% complete and polished.** Every page renders, the theme system works, search/filter/tabs are functional client-side, and the chat UI simulates streaming responses convincingly.

**Integration layer: 0% complete.** This is a **greenfield, mock-data-only frontend**:

- **Zero** `fetch` / `axios` / `XMLHttpRequest` calls anywhere in `src/`.
- **Zero** `import.meta.env` / `VITE_*` usage — no API base URL plumbing exists.
- TanStack Query is mounted (`QueryClientProvider`) but **no `useQuery`/`useMutation` is ever called**.
- All data is hardcoded module-level constant arrays.
- **No authentication or authorization is enforced** — login/signup are toast-only fakes, and every `/admin/*` route is publicly reachable by URL.
- **No token storage** — the only `localStorage` use is the UI theme.

**Bottom line:** The frontend is a presentational shell awaiting a backend. Every endpoint in `CLAUDE.md` must be built and then wired from scratch.

---

## 2. Folder Structure

```
DocMind/
├── index.html                 # Root HTML. Title "Research AI", <html class="dark">
├── package.json               # vite_react_shadcn_ts template, v0.0.0
├── vite.config.ts             # Vite 5, SWC, @ alias, port 8080
├── vitest.config.ts           # jsdom, globals, setup file
├── playwright.config.ts        # EMPTY — defaults only (no baseURL/webServer)
├── playwright-fixture.ts       # Pass-through re-export of @playwright/test
├── tailwind.config.ts          # Theme tokens, JetBrains Mono + Inter fonts
├── postcss.config.js           # tailwindcss + autoprefixer
├── components.json             # shadcn config (default style, slate base)
├── tsconfig.json               # Solution file (loose: strict=false)
├── tsconfig.app.json           # App config, @/* alias, vitest globals
├── tsconfig.node.json          # Node/build config (strict=true)
├── eslint.config.js            # Flat config v9, no-unused-vars OFF
├── CLAUDE.md                   # Authoritative backend spec
└── src/
    ├── main.tsx               # Minimal root render (no providers here)
    ├── App.tsx                # ALL providers + route definitions
    ├── App.css                # Vite boilerplate (DEAD — unimported)
    ├── index.css              # Real theme system: fonts, CSS vars, utilities
    ├── vite-env.d.ts          # Vite client types reference
    ├── components/
    │   ├── ui/                # 50 shadcn/ui primitives
    │   ├── AppSidebar.tsx     # End-user chat sidebar
    │   ├── AdminSidebar.tsx   # Admin panel sidebar
    │   ├── ChatInput.tsx      # Auto-resizing message composer
    │   ├── ChatMessage.tsx    # Single message bubble (streaming-aware)
    │   └── NavLink.tsx        # Compat wrapper for RR NavLink
    ├── hooks/
    │   ├── use-mobile.tsx     # Viewport < 768px detector
    │   ├── use-toast.ts       # shadcn toast store (module-global)
    │   └── useTheme.tsx       # Theme context (light/dark/auto)
    ├── lib/
    │   └── utils.ts           # cn() className merger
    ├── layouts/
    │   └── AdminLayout.tsx    # Sidebar + header + <Outlet/> for /admin
    ├── pages/
    │   ├── Index.tsx          # / — main chat
    │   ├── Chats.tsx          # /chats — history list
    │   ├── Settings.tsx       # /settings — user settings
    │   ├── Upgrade.tsx        # /upgrade — pricing
    │   ├── Login.tsx          # /login
    │   ├── Signup.tsx         # /signup
    │   ├── NotFound.tsx       # * — 404
    │   └── admin/             # 15 admin screens (see route map)
    └── test/
        ├── example.test.ts    # Single tautology test
        └── setup.ts           # jest-dom + matchMedia mock
```

| Directory | Purpose |
|-----------|---------|
| `src/components/ui/` | Vendored shadcn/ui primitives — leaf presentational components |
| `src/components/` | App-specific composed components (sidebars, chat parts) |
| `src/hooks/` | Reusable React hooks (mobile detect, toast, theme) |
| `src/lib/` | Pure utilities (`cn`) |
| `src/layouts/` | Route-level layout wrappers (admin only) |
| `src/pages/` | Route page components (user-facing) |
| `src/pages/admin/` | Route page components (admin panel) |
| `src/test/` | Vitest setup + example test |

---

## 3. Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` / `react-dom` | `^18.3.1` | Core React + DOM renderer |
| `react-router-dom` | `^6.30.1` | Client-side routing |
| `@tanstack/react-query` | `^5.83.0` | Async server-state cache (**mounted, unused**) |
| `react-hook-form` | `^7.61.1` | Form state/validation (**unused so far**) |
| `@hookform/resolvers` | `^3.10.0` | Zod↔RHF bridge (**unused**) |
| `zod` | `^3.25.76` | Schema validation / inference (**unused on FE**) |
| `recharts` | `^2.15.4` | Charts in admin dashboards |
| `sonner` | `^1.7.4` | Toast notifications (primary) |
| `lucide-react` | `^0.462.0` | Icon set |
| `next-themes` | `^0.3.0` | Theme switching (note: app uses custom `useTheme` instead) |
| `class-variance-authority` | `^0.7.1` | Typed component variants (CVA) |
| `clsx` | `^2.1.1` | Conditional classNames |
| `tailwind-merge` | `^2.6.0` | Tailwind class conflict resolution |
| `tailwindcss-animate` | `^1.0.7` | Animation utilities (registered plugin) |
| `date-fns` | `^3.6.0` | Date formatting |
| `cmdk` | `^1.1.1` | Command palette |
| `embla-carousel-react` | `^8.6.0` | Carousel |
| `input-otp` | `^1.4.2` | OTP input |
| `react-day-picker` | `^8.10.1` | Calendar/date picker |
| `react-resizable-panels` | `^2.1.9` | Resizable split panes |
| `vaul` | `^0.9.9` | Drawer/bottom-sheet |
| `@radix-ui/react-*` | (27 packages) | Headless UI primitives behind shadcn components |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `vite` | `^5.4.19` | Build tool / dev server |
| `@vitejs/plugin-react-swc` | `^3.11.0` | SWC-based React transform |
| `typescript` | `^5.8.3` | TS compiler |
| `vitest` | `^3.2.4` | Unit test runner |
| `@testing-library/react` | `^16.0.0` | Component testing utilities |
| `@testing-library/jest-dom` | `^6.6.0` | DOM matchers |
| `jsdom` | `^20.0.3` | DOM env for vitest |
| `@playwright/test` | `^1.57.0` | E2E test runner (**unconfigured**) |
| `tailwindcss` | `^3.4.17` | CSS framework (v3) |
| `@tailwindcss/typography` | `^0.5.16` | `prose` plugin (**installed, NOT registered** in tailwind.config) |
| `postcss` / `autoprefixer` | `^8.5.6` / `^10.4.21` | CSS pipeline |
| `eslint` + `typescript-eslint` | `^9.32.0` / `^8.38.0` | Linting (flat config) |
| `eslint-plugin-react-hooks` | `^5.2.0` | Hooks lint rules |
| `eslint-plugin-react-refresh` | `^0.4.20` | Fast-refresh lint |
| `@types/node` / `@types/react` / `@types/react-dom` | — | Type definitions |
| `globals` | `^15.15.0` | ESLint global identifiers |

### Missing — What the Backend Integration Will Need

The frontend currently has **no integration tooling**. Before wiring to the backend, expect to add (or decide against) the following on the frontend side:

- **HTTP client** — none present. Native `fetch` is the implied choice; a thin wrapper is needed for the base URL, `Authorization` header injection, `credentials: "include"` (for the refresh cookie), and error-envelope parsing.
- **Auth context/store** — none. Needs access-token state, refresh logic, route guards, and role gating.
- **`VITE_API_URL`** env var — does not exist; must be introduced.
- **MSW (or equivalent)** — recommended for testing the data layer; not present.

The backend itself (per `CLAUDE.md`) will require: Express, Mongoose, Qdrant client, Anthropic SDK, Voyage AI client, `multer`, `jsonwebtoken`, `bcrypt`, `helmet`, `express-rate-limit`, `cors`, `cookie-parser`, `pdf-parse`, `mammoth`, and `zod`.

---

## 4. Pages & Routes

Router: `react-router-dom` v6 with `BrowserRouter`. Provider nesting (outer→inner): `QueryClientProvider` → `ThemeProvider` → `TooltipProvider` → (`Toaster`, `Sonner`) → `BrowserRouter` → `Routes`.

### Full Route Map

| Path | Component | File | Layout | Intended Access | Enforced? |
|------|-----------|------|--------|-----------------|-----------|
| `/` | `Index` | `pages/Index.tsx` | self (SidebarProvider) | Protected (user) | ❌ open |
| `/chats` | `Chats` | `pages/Chats.tsx` | self | Protected (user) | ❌ open |
| `/settings` | `Settings` | `pages/Settings.tsx` | self | Protected (user) | ❌ open |
| `/upgrade` | `Upgrade` | `pages/Upgrade.tsx` | standalone | Public | n/a |
| `/login` | `Login` | `pages/Login.tsx` | standalone | Public | n/a |
| `/signup` | `Signup` | `pages/Signup.tsx` | standalone | Public | n/a |
| `/admin` (index) | `Dashboard` | `pages/admin/Dashboard.tsx` | AdminLayout | Admin | ❌ open |
| `/admin/conversations` | `Conversations` | `pages/admin/Conversations.tsx` | AdminLayout | Admin | ❌ open |
| `/admin/analytics` | `Analytics` | `pages/admin/Analytics.tsx` | AdminLayout | Admin | ❌ open |
| `/admin/knowledge-base` | `KnowledgeBase` | `pages/admin/KnowledgeBase.tsx` | AdminLayout | Admin | ❌ open |
| `/admin/documents` | `Documents` | `pages/admin/Documents.tsx` | AdminLayout | Admin | ❌ open |
| `/admin/data-sources` | `DataSources` | `pages/admin/DataSources.tsx` | AdminLayout | Admin | ❌ open |
| `/admin/embeddings` | `Embeddings` | `pages/admin/Embeddings.tsx` | AdminLayout | Admin | ❌ open |
| `/admin/upload` | `UploadPage` | `pages/admin/Upload.tsx` | AdminLayout | Admin | ❌ open |
| `/admin/users` | `Users` | `pages/admin/Users.tsx` | AdminLayout | Admin | ❌ open |
| `/admin/integrations` | `Integrations` | `pages/admin/Integrations.tsx` | AdminLayout | Admin | ❌ open |
| `/admin/labels` | `Labels` | `pages/admin/Labels.tsx` | AdminLayout | Admin | ❌ open |
| `/admin/notifications` | `Notifications` | `pages/admin/Notifications.tsx` | AdminLayout | Admin | ❌ open |
| `/admin/security` | `SecurityPage` | `pages/admin/Security.tsx` | AdminLayout | Admin | ❌ open |
| `/admin/settings` | `AdminSettings` | `pages/admin/Settings.tsx` | AdminLayout | Admin | ❌ open |
| `*` | `NotFound` | `pages/NotFound.tsx` | none | Public | n/a |

> `pages/admin/Placeholder.tsx` is imported in `App.tsx` but **never routed** — dead import.

### Per-Page Purpose & Backend Data Needs

**User-facing:**

- **`/` (Index)** — Main chat. Renders mobile/desktop layouts via `useIsMobile()`. Empty state shows greeting + `ChatInput` + welcome suggestion chips. **Currently fakes streaming** with `simulateResponse()` (canned text streamed char-by-char). Needs: `POST /api/chat/sessions/:id/messages` (streaming), session creation, source-doc rendering (not built yet).
- **`/chats` (Chats)** — History list, client-side title search. Needs: `GET /api/chat/sessions`.
- **`/settings` (Settings)** — Tabbed (General/Account/Privacy/Billing/Capabilities/Connectors); only **General** implemented (profile, notification toggles, theme). Theme switching genuinely works. Needs: `GET /api/auth/me` + a profile-update endpoint (not in spec).
- **`/upgrade` (Upgrade)** — Pricing page, 3 plans, comparison table, FAQ. CTAs are inert (no Stripe wiring despite trust badge).
- **`/login`, `/signup`** — Toast-only fakes; validate non-empty (+ password ≥ 8 on signup), then `navigate("/")`. No API, no token. Social buttons toast "not available". Needs: `POST /api/auth/login`, `POST /api/auth/register`.
- **`*` (NotFound)** — Logs bad path, links home.

**Admin (all mock data, no APIs, most action buttons inert):**

- **Dashboard** — KPI cards, conversation-trend AreaChart, topic PieChart, recent conversations, RAG perf bars → `GET /api/admin/stats`.
- **Conversations** — Conversation table with status/sentiment/source, fake pagination ("Showing N of 12,847"). No spec'd route.
- **Analytics** — Query volume, source distribution, peak hours, satisfaction charts. Period tabs are cosmetic. No spec'd route.
- **KnowledgeBase** — Collections ↔ documents views, hardcoded 78% indexing progress.
- **Documents** — Document table with type icons, status badges → `GET /api/documents`, `DELETE /api/documents/:id`.
- **DataSources** — External connector cards (Web Crawler, DB, Confluence, Drive, Notion, S3). Exposes mock connection strings. No spec'd route.
- **Embeddings** — Model + vector-collection tables, usage/cost charts. Mock providers are OpenAI/Cohere/Local (**spec mandates Voyage `voyage-3`**).
- **Upload** — Drag-drop zone (handler is a no-op), recent uploads, pipeline explainer → `POST /api/documents/upload`. **Advertises 50 MB + many file types** (spec: 10 MB, PDF/DOCX/TXT, 1 file).
- **Users** — User table with role/status filters → `GET /api/admin/users`, `PATCH /api/admin/users/:id/block`. Mock includes `moderator` role + tri-state status (**spec: `user|admin` + `isBlocked` boolean**).
- **Integrations, Labels, Notifications, Security, admin Settings** — All mock; not in spec'd routes. `Integrations` and admin `Settings` contain **fake-but-realistic API key strings** in source.

---

## 5. Components

### shadcn/ui Components (50 files in `src/components/ui/`)

Standard shadcn wrappers (Radix primitive + CVA + `cn`). No business logic, no backend calls. Full list: `accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip, use-toast`.

Notable: `sidebar.tsx` (22 KB) is a full sidebar framework — provider, context, collapsible rail, mobile sheet, menu primitives. `chart.tsx` wraps Recharts with theming.

### Custom Components (5 files)

| Component | Props | Purpose / Notes |
|-----------|-------|-----------------|
| `AppSidebar` | none | End-user chat sidebar. Brand "Research AI", nav menu, "Recents" list, footer profile popover. **Hardcodes** user `"Mehraf"`, plan `"Free plan"`, email `ronym0358@gmail.com` (PII at line 172), and `RECENT_CHATS` (11 fake titles). "Log out" item has **no handler**. |
| `AdminSidebar` | none (internal `NavSection` takes `{label, items, collapsed}`) | Admin sidebar. "RAG Admin" brand, 3 nav groups (MAIN/RAG/MANAGEMENT). Active state via `location.pathname`. Footer hardcodes `"Admin"` / `"Super Admin"`. |
| `ChatInput` | `{ onSend: (msg: string) => void; onStop?: () => void; isLoading: boolean }` | Auto-resizing textarea (max 200px). Enter sends, Shift+Enter newline. Emits `onSend`/`onStop`. |
| `ChatMessage` | `{ role: "user"\|"assistant"; content: string; isStreaming?: boolean }` | Single bubble with avatar, role label, copy button (assistant), blinking cursor when streaming. Assistant label hardcoded `"Research AI"`. |
| `NavLink` | extends `NavLinkProps` + `{ className?, activeClassName?, pendingClassName? }` | Compat wrapper mapping legacy string classNames to RR v6 function-className. |

### Component Dependency Map

- `AppSidebar` → `ui/sidebar`, `ui/popover`, `ui/separator`, `react-router-dom`, lucide icons.
- `AdminSidebar` → `ui/sidebar`, `lib/utils`, `react-router-dom`, lucide icons.
- `ChatInput`, `ChatMessage` → `lib/utils`, lucide icons (no other component deps).
- `NavLink` → `react-router-dom`, `lib/utils`.
- Custom components are **leaf-composed at the page level** — they don't import each other. Both sidebars build on the `ui/sidebar` framework.
- **No hardcoded API URLs, no `VITE_*`, no auth/token references in any component.** Role gating is implied only by which sidebar renders.

---

## 6. Hooks & Utilities

### Hooks

| Hook | API | Behavior |
|------|-----|----------|
| `useIsMobile()` (`use-mobile.tsx`) | → `boolean` | Tracks viewport < `MOBILE_BREAKPOINT` (768). `matchMedia` listener, returns `false` initially. |
| `useToast()` / `toast()` (`use-toast.ts`) | `useToast` → `{ toasts, toast, dismiss }`; `toast(props)` → `{ id, dismiss, update }` | shadcn toast store. **Module-global** state + reducer + listeners (not Context). `TOAST_LIMIT = 1`, `TOAST_REMOVE_DELAY = 1000000`. |
| `ThemeProvider` / `useTheme()` (`useTheme.tsx`) | `useTheme` → `{ theme, setTheme, resolved }` | Theme context. `Theme = "light"\|"dark"\|"auto"`. **Defaults to dark.** Persists to `localStorage["theme"]`, toggles `.dark` on `<html>`, listens to system theme when `auto`. |

### Utilities

- **`lib/utils.ts`** — exports `cn(...inputs)` = `twMerge(clsx(inputs))`. The standard className merge helper. Only file in `lib/`.

### Layouts

- **`AdminLayout.tsx`** — wraps `SidebarProvider` → `AdminSidebar` + header (`SidebarTrigger` + static "Admin Panel" label) + `<main><Outlet/></main>`. **No auth/role guard.** Takes no props.

### Shared State Patterns

- **Theme** is the only real cross-cutting state (React Context in `ThemeProvider`).
- **Toasts** use a module-global store (no Context).
- **No auth context, no API client, no fetch wrapper, no token storage** exist anywhere. The only `localStorage` use is the theme key.

---

## 7. API Contract (most important)

### Current reality

**There is no API layer.** The contract below is **inferred from mock-data shapes + UI behavior**, cross-referenced with the authoritative route table in `CLAUDE.md`. When the backend is built, the success-response envelope must match `CLAUDE.md`:

```json
{ "success": true,  "message": "...", "data": {}, "pagination": {} }
{ "success": false, "message": "...", "errors": [{ "field": "", "message": "" }] }
```

The frontend does **not yet consume** this envelope anywhere — the auth forms (which already do field validation) are the natural place to surface `errors[].field`.

### Endpoints the frontend expects

**Auth** (Bearer access token in header; refresh token in httpOnly cookie — client must use `credentials: "include"` on refresh):

| Method | Path | Access | Request body | Expected `data` |
|--------|------|--------|--------------|-----------------|
| POST | `/api/auth/register` | Public | `{ name, email, password }` | `{ user, accessToken }` |
| POST | `/api/auth/login` | Public | `{ email, password }` | `{ user, accessToken }` (+ refresh cookie) |
| POST | `/api/auth/refresh` | Cookie | — | `{ accessToken }` (rotated refresh cookie) |
| POST | `/api/auth/logout` | Auth | — | `{}` |
| GET | `/api/auth/me` | Auth | — | `{ user }` |

**Chat:**

| Method | Path | Access | Request body | Expected `data` |
|--------|------|--------|--------------|-----------------|
| GET | `/api/chat/sessions` | Auth | — | `ChatSession[]` (`{ id, title, updatedAt }`) |
| POST | `/api/chat/sessions` | Auth | `{ title? }` | `ChatSession` |
| GET | `/api/chat/sessions/:id` | Auth | — | session + `Message[]` |
| DELETE | `/api/chat/sessions/:id` | Auth | — | `{}` |
| POST | `/api/chat/sessions/:id/messages` | Auth | `{ content }` | assistant `Message` + `sourceDocs[]` (UI expects **streaming**; renders blinking cursor; has a stop/cancel control) |

**Documents:**

| Method | Path | Access | Request | Expected `data` |
|--------|------|--------|---------|-----------------|
| GET | `/api/documents` | Auth | — | `Document[]` |
| POST | `/api/documents/upload` | Admin | `multipart/form-data` (1 file) | `Document` (status `processing`→`ready`) |
| DELETE | `/api/documents/:id` | Admin | — | `{}` |

**Admin:**

| Method | Path | Access | Request | Expected `data` |
|--------|------|--------|---------|-----------------|
| GET | `/api/admin/users` | Admin | — | `User[]` |
| PATCH | `/api/admin/users/:id/block` | Admin | `{ isBlocked }` | updated `User` |
| GET | `/api/admin/stats` | Admin | — | dashboard KPIs + series |

### Key data shapes (the only declared TS interfaces)

```ts
// Index.tsx
type Msg = { role: "user" | "assistant"; content: string };

// ChatMessage.tsx
interface ChatMessageProps { role: "user" | "assistant"; content: string; isStreaming?: boolean; }

// ChatInput.tsx
interface ChatInputProps { onSend: (message: string) => void; onStop?: () => void; isLoading: boolean; }

// admin/Upload.tsx
interface UploadedFile {
  id: string; name: string; size: string; sizeBytes: number; type: string;
  status: "uploading" | "processing" | "indexed" | "error";
  progress: number; chunks?: number; uploadedAt: string; source: string;
}
```

All other entities (User, Document, ChatSession, Conversation, Embedding) exist **only as untyped inline mock arrays**. Representative mock shapes:

```ts
// admin/Documents.tsx
{ id, name, type: "PDF"|"MD"|"CSV"|"DOCX"|"JSON"|"HTML", size, pages, chunks,
  status: "indexed"|"processing"|"queued"|"error", uploadedAt, uploadedBy }

// admin/Users.tsx
{ id, name, email, role: "admin"|"moderator"|"user",
  status: "active"|"inactive"|"suspended", lastActive, conversations, joined }
```

### VITE_ env vars referenced

**None.** No `import.meta.env.VITE_*` anywhere. A `VITE_API_URL` base-URL var must be introduced when wiring the API.

---

## 8. Test Coverage

### What is tested

- **Effectively nothing.** The only test is `src/test/example.test.ts`: `expect(true).toBe(true)`. It confirms the runner works and nothing else. Application coverage ≈ **0%**.

### Infrastructure present

- **`src/test/setup.ts`** — imports `@testing-library/jest-dom`; mocks `window.matchMedia` (always `matches: false`, both legacy and modern listener APIs) so `next-themes`/`use-mobile`/`sidebar` don't crash.
- **`vitest.config.ts`** — `jsdom`, `globals: true`, setup file wired, `include: src/**/*.{test,spec}.{ts,tsx}`, `@` alias. **No coverage provider configured.**
- **`playwright-fixture.ts`** — pass-through re-export, no custom fixtures.
- **`playwright.config.ts`** — **empty/default**. No `testDir`, `baseURL`, `webServer`, or browser `projects`. E2E can't meaningfully run (won't auto-start the dev server).

### Gaps to fill

- **All ~22 pages** untested (user + admin).
- **All 5 custom components** untested (`AppSidebar`, `AdminSidebar`, `ChatInput`, `ChatMessage`, `NavLink`).
- **All 3 hooks** untested — despite `useTheme`/`use-mobile` depending on the `matchMedia` mock.
- **`lib/utils.ts` (`cn`)** untested (trivially unit-testable).
- **`App.tsx` routing** untested (no protected-route or 404 tests).
- **No API/data-layer tests** — no MSW, no fetch mocking, no react-query test.
- **No form-validation tests** despite RHF + Zod deps.
- **No E2E specs** for login/signup/chat/upload/admin.
- **Likely future failures:** no `ResizeObserver`/`IntersectionObserver` mocks (Radix needs them).
- **No coverage reporting**, no `playwright test` npm script, no CI wiring evident.

---

## 9. Observations & Issues

### Hardcoded that should be dynamic

1. **User identity** — `"Mehraf"`, plan `"Free plan"`, and email `ronym0358@gmail.com` are hardcoded in `AppSidebar.tsx` (real PII in source). Should come from `GET /api/auth/me`.
2. **Recent chats** — `RECENT_CHATS` (11 strings) in `AppSidebar`; `CHATS` (15 objects) in `Chats.tsx`. Should come from `GET /api/chat/sessions`.
3. **Every admin dataset** — all stats, tables, and chart series are static module constants. Should come from the respective admin/document APIs.
4. **Chat responses** — `simulateResponse()` streams a canned paragraph; no LLM call.
5. **Progress/score values** — KnowledgeBase 78% indexing, Security score 82, etc. are literals.

### Missing error handling

- No consumption of the API error envelope anywhere. Auth forms only do client-side non-empty checks. No network-error handling, no retry, no loading/error states tied to real requests.

### Spec divergences (frontend mock vs. `CLAUDE.md` — spec is authoritative)

| Area | Frontend mock | `CLAUDE.md` spec |
|------|---------------|------------------|
| Upload size | "Max 50 MB", batch upload | 10 MB, **1 file** |
| Upload types | PDF/DOCX/CSV/MD/TXT/HTML/JSON/PNG-JPG (OCR) | **PDF/DOCX/TXT only** |
| User roles | `admin`/`moderator`/`user` | **`user`/`admin`** |
| User status | tri-state `active`/`inactive`/`suspended` | **`isBlocked` boolean** |
| Embedding provider | OpenAI/Cohere/Local | **Voyage AI `voyage-3`** |
| LLM models listed | GPT-5, Gemini 2.5, Llama 3.3 | **`claude-sonnet-4-6` only** |
| Document types | includes CSV/JSON/HTML/MD | PDF/DOCX/TXT |

### Security concerns

- **No auth/authorization enforcement** — `/admin/*` and user pages are open by URL. Contradicts the JWT + `requireRole` model.
- **Fake-but-realistic secrets in source** — `Integrations.tsx` (`sk-prod-...`), admin `Settings.tsx` (`sk_live_••••wXyZ`), `DataSources.tsx` (DB/S3 connection strings). Even though mock, these should not ship.

### Inconsistencies & dead code

- **Branding mismatch** — `index.html` title/meta/OG all say **"Research AI"**, not DocMind; sidebars and chat labels say "Research AI" too.
- **Dead code** — `App.css` (never imported), `pages/admin/Placeholder.tsx` (imported in `App.tsx`, never routed).
- **`@tailwindcss/typography`** installed but not registered in `tailwind.config.ts`.
- **Tailwind content globs** reference `./pages`, `./components`, `./app` (root-level, don't exist) — only `./src/**` is meaningful.
- **Loose TypeScript** — app tsconfig runs `strict: false`, `noImplicitAny: false`, `strictNullChecks: false`, conflicting with `CLAUDE.md`'s "no `any` type" backend rule (the backend should use its own strict tsconfig).
- **Package name** still `vite_react_shadcn_ts`, version `0.0.0` (template not renamed).
- **No `TODO`/`FIXME` markers** anywhere — gaps are by omission, not annotation.
