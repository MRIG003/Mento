# ADR-009: Link tokens in the URL fragment; ids in query strings; no dynamic route segments

## Status
Accepted (Phase 2), 2026-11-03

## Context
Student/parent links are shared in WhatsApp groups. Tokens must be unguessable and must not leak into server logs or Referer headers.
Pages are static, and data is client-side.

## Decision
- Student/parent links: `https://<host>/h#k=<22-char token>&lang=hi`; join links `/join#k=<token>`. The fragment is never sent to the server.
- Tokens: 128-bit `crypto.getRandomValues`, base64url.
- Teacher-only internal ids use query strings (`/t/results?hw=…`) read via `useSearchParams` inside Suspense, so routes stay static.
- No names or personal data in any URL.

## Alternatives considered
- **`/h/[token]` dynamic segment:** the token lands in Vercel request logs, and pages become on-demand rendered. Rejected.
- **`?k=token` query:** also logged server-side. Rejected.

## Consequences
Some in-app browsers drop fragments on redirects; we never redirect `/h`. The e2e test opens the link exactly as shared.
