# ADR-006: Minimal hand-written service worker and web manifest

## Status
Accepted (Phase 2), 2026-11-03. Verified against the Next 16.4.2 bundled guide `progressive-web-apps.md` (manifest via `app/manifest.ts`,
`/sw.js` served with `Cache-Control: no-cache` and a strict CSP).

## Context
Students on weak connections must be able to reopen the link and keep their answers. The app is installable from the browser. No push notifications in v1.

## Decision
- `app/manifest.ts` (name Mento, paper background and theme colour, icons).
- `public/sw.js` (~80 lines): precache the app shell routes (`/`, `/h`, `/t`) and versioned `/_next/static/*` assets on install;
  cache-first for `/_next/static` and fonts; network-first with cache fallback for navigations; old caches cleaned on activate.
  Registered from a client component after `load`.
- Answers are already local (ADR-001), so offline means "the shell opens".

## Alternatives considered
- **next-pwa / Serwist:** extra build integration and dependency; more than needed. Rejected.
- **No service worker:** a cold reopen offline would fail on the student link. Rejected.

## Consequences
A cache-busting version constant must change when the shell changes; the e2e test covers an offline reopen of `/h`.
