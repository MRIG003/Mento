# ADR-012: Exact pins, releases at least 14 days old, short dependency list

## Status
Accepted (Phase 2), 2026-11-03

## Context
A children's-data app should minimise supply-chain risk. Several packages had releases within the last few days.

## Decision
Exact versions (no `^`), choosing the newest release published ≥ 14 days earlier (list in SPEC §2). Committed lockfile, `npm ci` in CI,
`npm audit` before release. New dependencies need owner approval (Ask first). @playwright/test is pinned to 1.63.0 to match the
preinstalled browser.

## Alternatives considered
- **Caret ranges / latest:** picks up fresh releases automatically, which is exactly the risk. Rejected.

## Consequences
Upgrades are deliberate; re-check the CSP and SRI behaviour on each Next upgrade (ADR-008).
