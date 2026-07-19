# DevPraxis

Collaborative knowledge hub for tech-interview preparation — articles, topics,
favorites, Notion import, and an AI assistant grounded in the knowledge base.

Backend: Express 5 · TypeScript (strict, native type stripping) · MongoDB/Mongoose 9 ·
Zod 4 · JWT (access + rotating refresh) · Ollama (OpenAI-compatible API) · @openai/agents

## Features

- **Auth**: registration/login, short-lived access token (15 min) + refresh token
  in an httpOnly cookie with rotation, reuse detection, and a per-user session cap
- **Articles**: markdown content, topics (1–3 per article), draft → published
  lifecycle, public feed with filters, pagination and full-text search, favorites
  with an atomic denormalized counter
- **Import**: from Notion (official API, markdown endpoint) or by uploading a .md file
- **AI**: article summary and interview questions (structured output), article
  translation (ru/en/de) creating a draft copy, and the Prep Coach chat agent with
  knowledge-base search tools and a programming-topics-only guardrail

## Quick start

Prerequisites: Node ≥ 24, MongoDB (Atlas or local), Ollama with the model listed
in `apps/api/src/config/aiModels.ts` (for a cloud model, run `ollama signin` first).

```bash
git clone <repo> && cd DevPraxis
npm install
cp apps/api/.env.example apps/api/.env   # fill in MONGO_URI and JWT_ACCESS_SECRET
npm run dev                               # http://localhost:3000, check: GET /health
```

Generate a JWT secret:
`node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

## API

Every response uses a single envelope: `{ data, meta? }` on success,
`{ error: { message, code, details? } }` on failure.
A ready-made Postman collection with automatic token handling lives at
`docs/devpraxis.postman_collection.json`.

| Area     | Endpoints                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------- |
| Auth     | `POST /api/auth/register · login · refresh · logout`                                                                      |
| Topics   | `GET/POST /api/topics`, `DELETE /api/topics/:id`                                                                          |
| Articles | `GET /api/articles` (filters/search), `GET /:idOrSlug`, `POST /`, `PATCH /:id`, `POST /:id/publish`, favorites, `GET /me` |
| Import   | `POST /api/articles/import/notion`, `POST /api/articles/import/upload`                                                    |
| AI       | `GET /api/ai/models`, `POST /api/ai/articles/:id/summary · questions · translate`, `POST /api/ai/chat`                    |

## Architectural decisions

- **Feature-based modules** (`modules/auth`, `modules/articles`, ...): the
  routes → controller → service → model layering lives inside each feature,
  not across the project
- **Subpath imports** (`#modules/...`) with conditions: the same import specifier
  resolves to `src/*.ts` in dev and `dist/*.js` in prod, no bundler involved
- **Refresh token is not a JWT**: 48 random bytes, only its SHA-256 hash is stored,
  rotation via an atomic `findOneAndDelete`, capped sessions per user
- **Idempotent favorites**: the "not yet favorited" precondition is encoded in the
  query filter itself (conditional update) instead of being inferred from the result
- **AI layer behind a provider interface**: local Ollama in dev; switching to any
  OpenAI-compatible cloud API is an env-variable change; structured output is
  hardened with a custom JSON extractor + Zod validation of model responses

## Monorepo

npm workspaces: `apps/api` (this backend), `apps/web` (planned, React),
`packages/shared` (planned, shared Zod schemas).
Root commands: `npm run dev · typecheck · lint · build`.
