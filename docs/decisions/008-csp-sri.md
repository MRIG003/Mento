# ADR-008: Static rendering with a strict CSP using Next's experimental SRI

## Status
Proposed (Phase 2), **unverified**: to be confirmed in slice 1 in a real browser. Source: Next 16.4.2 bundled docs
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
