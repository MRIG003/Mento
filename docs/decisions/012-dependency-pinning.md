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

## Notes from T1 (2026-11-03)
- ESLint pinned to 9.39.5 instead of 10.x: eslint-plugin-import/react/jsx-a11y (used by eslint-config-next 16.4.2) declare `eslint <= 9`.
- npm 10.9.9 (bundled with Node 22) crashes in its peer resolver (`Cannot read properties of null (reading 'edgesOut')`) when
  *adding* vitest 5.0.x, after the Vitest 5.1.0 release. The lockfile was generated with `npx npm@11.21.1 install`. `npm ci`
  with npm 10 installs from that lockfile fine (verified). When adding dev dependencies, use `npx npm@11.21.1 install …`.
- `npm audit`: production dependencies have 0 vulnerabilities. Dev-only: 16 moderate findings, all one minimatch ReDoS advisory
  (<11.0.1) inside the ESLint plugin chain; the fix needs a breaking ESLint change. Accepted: lint runs only on our own source files. Re-check on upgrade.
