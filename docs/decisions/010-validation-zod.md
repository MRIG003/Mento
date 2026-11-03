# ADR-010: zod 4 for boundary validation (zod/mini on client routes)

## Status
Accepted (Phase 2), 2026-11-03

## Context
We parse untrusted data at several boundaries (storage, fragment/query, file metadata, forms) and want types derived from schemas (single source of truth).

## Decision
Use zod 4.6.7. Entity schemas live in `domain/schemas.ts`; types are `z.infer`. Code shipped to the student route uses the
`zod/mini` functional API to keep bytes down; the bundle check verifies the budget.

## Alternatives considered
- **Hand-written guards:** no dependency, but more code and drift between types and validators. Rejected.
- **valibot:** smaller, but similar enough that the familiarity of zod wins. Revisit if the budget is tight.

## Consequences
One runtime dependency beyond React/Next; its size is measured in `docs/perf.md`.
