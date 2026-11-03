# Architecture Decision Records

| ADR | Decision | Status |
|---|---|---|
| [001](001-storage-layer.md) | Local-first storage behind async, role-scoped repositories | Accepted |
| [002](002-i18n-approach.md) | Own typed i18n runtime, client language state, no locale routes | Accepted |
| [003](003-camera-quality-heuristics.md) | Photo quality heuristics as pure functions over ImageData | Accepted (thresholds to calibrate) |
| [004](004-gap-rules.md) | Evidence-based gap rules and parent-report bands | Accepted |
| [005](005-onboarding-model.md) | Resumable per-role onboarding state machine plus own coach marks | Accepted |
| [006](006-pwa-offline.md) | Minimal hand-written service worker and manifest | Accepted |
| [007](007-typescript-6.md) | TypeScript 6.0.x, not 7.x | Accepted |
| [008](008-csp-sri.md) | Static rendering; CSP `script-src 'self' 'unsafe-inline'` (SRI tried, blocks hydration) | Accepted (fallback, verified) |
| [009](009-link-tokens-in-fragment.md) | Tokens in the URL fragment, ids in query strings | Accepted |
| [010](010-validation-zod.md) | zod 4 (zod/mini on client routes) | Accepted |
| [011](011-module-isolation.md) | Feature modules never import each other | Accepted |
| [012](012-dependency-pinning.md) | Exact pins, releases ≥ 14 days old | Accepted |

Docs sources: Next.js 16.4.2 docs bundled in the npm package (`next/dist/docs`), because nextjs.org is not reachable from the
build container. Tailwind v4, Vitest 5, Playwright and MDN pages are checked per slice when their APIs are used (source-driven).
