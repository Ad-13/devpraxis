# Security notes — accepted risks

Tracked `npm audit` findings that are currently unfixable without a downgrade
or an unreleased upstream patch. Re-run `npm audit` before each deploy and
after dependency updates; remove an entry once its upstream ships a fix.

## 1. shell-quote (via concurrently) — HIGH

GHSA-395f-4hp3-45gv — quadratic-complexity DoS in `parse()`.
No patched shell-quote release exists yet (advisory covers all versions
`<=1.8.4`, i.e. every published version). `npm audit fix --force` only
tricks dedup, it does not fix the root package.
**Exposure:** dev-only tool; `concurrently` only parses our own npm scripts
from `package.json`, never untrusted input. No practical attack surface.
**Action:** re-check after any `concurrently` update; no fix to apply today.

## 2. sharp (via next) — HIGH

GHSA-f88m-g3jw-g9cj — inherited libvips CVEs (2026-33327/33328/35590/35591).
`next@^15` has not yet bumped its bundled `sharp`; fixing requires
downgrading Next to `9.x` — unacceptable.
**Exposure:** `sharp` powers `next/image` optimization; we do not currently
process untrusted/remote images through it. No practical attack surface yet
— re-evaluate before enabling remote image sources.
**Action:** wait for a Next patch release; `npm update next` periodically.

## 3. postcss (via next) — MODERATE

GHSA-qx2v-qp2m-jg93 — XSS via unescaped `</style>` in stringified output.
Same root cause as #2 (bundled by Next, fix requires the same downgrade).
**Exposure:** triggers only when stringifying attacker-controlled CSS back
into a page; we don't generate CSS from user input. No practical exposure.
**Action:** resolves together with #2 once Next updates.

## 4. @hono/node-server (via @openai/agents → MCP SDK) — MODERATE

GHSA-frvp-7c67-39w9 — path traversal in `serve-static` on Windows via
encoded backslash. Fix requires downgrading `@openai/agents` to `0.3.7`.
**Exposure:** we use the agents library only as an MCP _client_; we never
start an Hono static-file server. No practical attack surface.
**Action:** re-check after `@openai/agents` updates.

---

Last reviewed: 2026-07-23
