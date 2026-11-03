# ADR-011: Feature modules never import each other

## Status
Accepted (Phase 2), 2026-11-03. From the approved CAPABILITY-MAP.md.

## Context
Thirteen modules built slice by slice; a tangle would make every slice touch others and block a later backend swap.

## Decision
`foundation`/`domain` → `data`/`services` → features. Features connect via routes and `data` only. Each module exposes `index.ts`;
ESLint `no-restricted-imports` blocks deep and feature→feature imports.

## Alternatives considered
- **Free imports between features:** faster at first, then coupled. Rejected.

## Consequences
Shared UI goes to `foundation` and shared logic to `domain`, never "borrowed" from a sibling feature.
