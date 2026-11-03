# ADR-008: Static rendering with a strict CSP using Next's experimental SRI

## Status
**Superseded by the documented fallback (T2, 2026-11-03).** See "Verification result" below. Source: Next 16.4.2 bundled docs
`02-guides/content-security-policy.md` (sections "Without Nonces" and "Subresource Integrity (Experimental)").

## Context
Children's data is on the device, so script injection is the worst case. Nonce-based CSP forces dynamic rendering of every page
(slower on slow 4G, no CDN caching, PPR incompatible, per the docs).

## Decision
Set the CSP in `next.config` `headers()` with `script-src 'self'` and enable `experimental.sri` so static pages keep integrity-checked
scripts. Plus the other headers in the threat model §4.

## Alternatives considered
- **Nonces via `proxy.ts`:** strongest, but every page becomes dynamic. Rejected for performance and cost.
- **`script-src 'self' 'unsafe-inline'`** (docs' "without nonces"): the documented **fallback** if SRI blocks Next's inline bootstrap
  scripts in testing. The risk is mitigated by React escaping, no HTML rendering of user content, and no third-party scripts.

## Consequences
SRI is experimental: pin the Next version and re-test the CSP on every Next upgrade (e2e asserts no CSP violations in the console).

## Verification result (T2, 2026-11-03)
Built with `experimental.sri` and `script-src 'self'`, served with `next start`, opened in Chromium 1243 at 390 px:
external chunks received `integrity` attributes, but three inline scripts (the RSC flight payload, 43-4368 bytes) were
blocked ("Executing inline script violates ... script-src 'self'"), and the page did not hydrate (a click handler never ran).

**Decision now:** `script-src 'self' 'unsafe-inline'` (docs' "Without Nonces"), without `experimental.sri`. All other directives
stay strict: `default-src 'self'`, `connect-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, and no
third-party origins. Residual XSS risk is mitigated by React text escaping, a lint ban on `dangerouslySetInnerHTML`/`innerHTML`/`eval`,
and no HTML rendering of user content (threat model T2).

**Revisit when:** a backend exists (nonces via `proxy.ts` become affordable), or Next supports hashing inline payload scripts for static pages.
