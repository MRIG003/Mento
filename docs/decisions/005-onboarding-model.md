# ADR-005: Onboarding as a resumable per-role state machine plus lightweight coach marks

## Status
Accepted (Phase 2), 2026-11-03

## Context
Onboarding is a core feature: every role needs a fast route to the "aha" moment, skippable and resumable, never a wall. Tours must not
bloat the student route.

## Decision
- `OnboardingProgress` per role in `data`: ordered steps with status (todo / done / skipped); resume lands on the first unfinished step.
- Real screens are used for the steps (create, results); onboarding steers with query flags (`?mission=1`) and coach marks, not duplicate screens.
- Coach marks: our own `CoachMark` primitive (max 4 per screen, one sentence each), content in i18n, seen-state persisted, Help replays. Tour code is lazy-loaded.
- The Starter Checklist reads the same progress records (rendered by `desk`).

## Alternatives considered
- **A tour library (react-joyride, shepherd):** 20-60 KB plus styling fights with the Stationery Desk theme. Rejected.
- **Separate onboarding-only replica screens:** they'd drift from the real ones and double the work. Rejected.

## Consequences
Real screens must tolerate "mission mode" prefills. Feature modules stay independent (they read flags from the URL, not onboarding imports).
