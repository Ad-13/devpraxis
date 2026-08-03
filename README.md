# DevPraxis

Notion is where notes live. DevPraxis is where they become interview practice.

A shared knowledge base for technical-interview preparation. Import articles
from Notion, translate them into another language as a reviewable draft, get an
AI summary or a set of interview questions, and ask a coaching agent grounded in
the articles themselves.

**Stack:** Next.js 16 · React 19 · Express 5 · Node 24 · TypeScript (strict) ·
MongoDB / Mongoose · Zod 4 · JWT with rotating refresh tokens · any
OpenAI-compatible AI provider

---

## Features

- **Auth** — registration and login, short-lived access token plus a rotating
  refresh token in httpOnly cookies, reuse detection, a per-user session cap,
  and double-submit CSRF protection
- **Articles** — markdown content, 1–3 topics each, draft → published lifecycle,
  public feed with search and filters, favourites with a denormalised counter
- **Import** — from Notion via its API, or by uploading a `.md` file
- **AI** — article summary, generated interview questions with model answers,
  translation into another language as a reviewable draft, and the Prep Coach
  agent with knowledge-base search tools and an on-topic guardrail

---

## Requirements

- **Node 24 or newer** — the API runs TypeScript through Node's native type
  stripping, which earlier versions do not support
- **MongoDB** — Atlas or a local instance
- **An API key from any OpenAI-compatible AI provider**, for example
  [Groq](https://console.groq.com) (free tier, no card required). A local
  [Ollama](https://ollama.com) works too — only the base URL changes.

---

## Quick start

```bash
git clone https://github.com/Ad-13/devpraxis.git
cd devpraxis
npm install

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

npm run dev
```

Then open **http://localhost:3001**.

Two processes start together: the API on port 3000 and the web app on 3001.
The browser only ever talks to 3001 — see [Architecture](#architecture) below.

Check the API is alive: `curl http://localhost:3000/health`

### Filling in the environment

`apps/api/.env` needs three values before the API will start. It validates its
environment on boot and exits with a readable message if anything is missing.

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

| Variable                 | Required | What it is                                                                |
| ------------------------ | -------- | ------------------------------------------------------------------------- |
| `MONGO_URI`              | yes      | `mongodb://` or `mongodb+srv://` connection string                        |
| `JWT_ACCESS_SECRET`      | yes      | at least 32 characters, generated not invented                            |
| `AI_API_KEY`             | yes      | key from your AI provider                                                 |
| `AI_BASE_URL`            | no       | defaults to a local Ollama; for Groq use `https://api.groq.com/openai/v1` |
| `ACCESS_TOKEN_TTL_MIN`   | no       | 15 by default; lower it to test session refresh                           |
| `REFRESH_TOKEN_TTL_DAYS` | no       | 7 by default                                                              |
| `WEB_ORIGIN`             | no       | `http://localhost:3001` by default                                        |
| `TRUST_PROXY`            | no       | `0` locally, `1` behind a platform proxy                                  |
| `ENABLE_DOCS`            | no       | `true` exposes Swagger UI at `/docs`                                      |

`apps/web/.env.local` needs nothing edited for local work, but note that
`API_INTERNAL_URL` uses `127.0.0.1` rather than `localhost` on purpose:
`localhost` resolves to both IPv6 and IPv4, and Node's fallback between them
makes the first request of a session fail.

### First run

The article form requires at least one topic, and the database starts empty.
Register an account, open **Topics**, and add a couple before writing anything.

---

## Commands

| Command                     | What it does                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `npm run dev`               | builds the shared package, then runs it in watch mode alongside the API and the web app |
| `npm run build`             | production build of all three packages                                                  |
| `npm run check`             | lint, formatting check and type check — run this before pushing                         |
| `npm run typecheck`         | types only                                                                              |
| `npm run lint` / `lint:fix` | ESLint                                                                                  |
| `npm run format`            | Prettier                                                                                |

`packages/shared` is a **built** package: the API and the web app import its
`dist`, not its sources. Editing it without a running build means the change is
invisible to both — which is why `npm run dev` keeps `tsc --watch` on it.

---

## Architecture

### Monorepo

apps/api Express API
apps/web Next.js app
packages/shared Zod schemas, domain constants, response envelope types
`packages/shared` is the point of the monorepo. A validation rule is written
once: the API validates requests against it, the web app validates its forms
against the same object, and the TypeScript types on both sides are inferred
from it. The alternative — writing the rules twice — fails silently, because a
limit raised on one side and not the other breaks nothing loudly.

### Single origin

The browser never calls the API directly. Next proxies `/api/*` to the backend,
so every request the browser makes is same-origin. That removes CORS, makes
cookies behave identically in development and production, and keeps the API
address off the client entirely.

Server Components and Server Actions call the API directly over the internal
URL, forwarding the browser's cookies by hand — a server-to-server request
carries nothing on its own.

### Authentication

Access token and refresh token both live in httpOnly cookies. The refresh token
is not a JWT: it is 48 random bytes, stored only as a SHA-256 hash, rotated on
every use through an atomic `findOneAndDelete`, with a cap on sessions per user.
Mutations are protected by double-submit CSRF with a timing-safe comparison.

The refresh cookie is scoped to `/api/auth`, so it never travels with page
requests — which also means only the browser can renew a session, never the
Next server. `/api/auth/me` distinguishes an expired token from an absent one,
and the client uses that to decide whether renewal is worth attempting.

### User content is untrusted

Articles are user-written markdown, and markdown permits raw HTML. The render
pipeline turns embedded HTML into nodes, sanitises them, and only then produces
React elements — never an HTML string. Two independent barriers: the sanitiser
removes dangerous nodes, and React cannot turn text into markup at all.

### Layout

The API is feature-based: `modules/{auth,articles,topics,ai}`, each owning its
own routes → controller → service → model. The web app follows Feature-Sliced
Design reconciled with the App Router: `app` is thin routing, below it are
views, widgets, features, entities and shared, with imports only going down.

---

## API

Every response uses one envelope: `{ data, meta? }` on success,
`{ error: { message, code, details? } }` on failure.

A Postman collection with automatic token handling lives at
`docs/devpraxis.postman_collection.json`.
With `ENABLE_DOCS=true`, Swagger UI is served at `/docs`.

| Area     | Endpoints                                                                                                                                                 |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth     | `POST /api/auth/register · login · refresh · logout`, `GET /api/auth/me`                                                                                  |
| Topics   | `GET/POST /api/topics`, `DELETE /api/topics/:id`                                                                                                          |
| Articles | `GET /api/articles`, `GET /:idOrSlug`, `POST /`, `PATCH /:id`, `POST /:id/publish · unpublish`, `DELETE /:id`, favourites, `GET /me`, `GET /favorites/me` |
| Import   | `POST /api/articles/import/notion · upload`                                                                                                               |
| AI       | `GET /api/ai/models`, `POST /api/ai/articles/:id/summary · questions · translate`, `POST /api/ai/chat`                                                    |

---

## Deployment

The web app and the API are deployed separately, because they want different
things: Next benefits from CDN edge delivery, while Express holds a database
connection pool open between requests and needs a long-lived process.

**API — Render (or Railway, Fly):**
Build: npm ci --include=dev && npm run build --workspace @devpraxis/shared && npm run build --workspace @devpraxis/api
Start: npm run start --workspace @devpraxis/api
`--include=dev` is not optional: platforms set `NODE_ENV=production`, which
makes `npm ci` skip devDependencies — and TypeScript and the `@types/*`
packages are needed to build, not to run.

**Web — Vercel**, root directory `apps/web`:
Install: cd ../.. && npm ci --include=dev
Build: cd ../.. && npm run build --workspace @devpraxis/shared && npm run build --workspace @devpraxis/web
Set `TRUST_PROXY=1` on the API so the rate limiter reads the real client
address from `X-Forwarded-For` instead of seeing every visitor as one IP.
Set `WEB_ORIGIN` to the deployed web address, with a scheme and **no trailing
slash** — the CSRF check compares it against the `Origin` header verbatim.

---

## Known limitations

- **No tests.** The intended starting points are the pure functions
  (`normalizeMarkdown`, `extractHeadings`, `parseFeedSearchParams`) and, most
  importantly, the markdown sanitiser — a regression there is a vulnerability,
  not a cosmetic bug.
- **Creating an article is two calls** — create, then publish — and they are not
  atomic. A failure between them leaves an orphaned draft.
- **Feed search uses a regular expression**, not the MongoDB text index, so that
  partial words match. It does not scale past a few thousand articles.
- **Topics are self-service**: any signed-in user can add or remove them.

See `SECURITY_NOTES.md` for accepted `npm audit` findings and why each one has
no practical exposure here.
