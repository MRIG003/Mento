# ADR-007: TypeScript 6.0.x, not 7.x

## Status
Accepted (Phase 2), 2026-11-03. Source: Next 16.4.2 bundled docs `05-config/02-typescript.md`; npm peerDependencies.

## Context
TypeScript 7 (native) is released and Next 16 can type-check with it, but "TypeScript 7 does not currently provide the JavaScript
compiler API" (Next docs). typescript-eslint 8.72 declares `typescript >=4.8.4 <6.1.0`, and eslint-config-next depends on it.

## Decision
Pin `typescript@6.0.3`. Revisit when typescript-eslint supports 7.

## Alternatives considered
- **TS 7 for typecheck + TS 6 for lint:** two compilers, confusing. Rejected.
- **Drop typed lint rules:** loses jsx-a11y/next rules integration. Rejected.

## Consequences
Slower `tsc` than the native compiler; acceptable for this codebase size.
