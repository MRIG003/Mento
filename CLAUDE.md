# Mento — project rules for Claude Code sessions

Mento: mobile-first web app for teachers in affordable private schools in India (Classes 3-8).
Core loop: Create -> Check -> See who is stuck -> Act. English and Hindi are equal citizens.

## Stack (decided, do not re-ask)
Next.js App Router + TypeScript (strict, noUncheckedIndexedAccess) + Tailwind + Vitest
(+ Playwright smoke tests at 390px, EN + HI). Deploy target: Vercel. Node 22.

## Commands (verified at Checkpoint A, 2026-11-03)
`npm ci` · `npm run dev` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` · `npm run e2e` ·
`npm run size` · `npm run check` (all of lint, typecheck, test, build, size). `npm run e2e` needs a prior `npm run build`.
Local server helper for browser checks: `npx next start -p 3100` (Playwright uses port 3100).

## Installing
Use `npm ci`. To add a package (after asking), use `npx npm@11.21.1 install -E <pkg>@<ver>`; npm 10 crashes on vitest peers (ADR-012).

## Where things are
CAPABILITY-MAP.md (module ids) · SPEC.md + SPEC-<id>.md · docs/threat-model.md · docs/decisions/ (ADRs) ·
docs/creative-brief.md · tasks/plan.md, tasks/todo.md. Next.js docs for the pinned version are in
`node_modules/next/dist/docs` (nextjs.org is blocked from the container).

## Phases and gates
0 Setup + one question round -> 1 Brainstorm (docs/creative-brief.md) [GATE] ->
2 Capability map [GATE] -> SPEC.md + docs/threat-model.md + ADRs [GATE] ->
3 Plan (tasks/plan.md, tasks/todo.md) [GATE] -> 4 Build slice by slice ->
5 Verify whole product -> 6 Ship [GATE before production deploy].
Stop for human approval only at the gates. Everywhere else keep going.

## Skills (.claude/skills, only these)
idea-refine (P1); spec-driven-development, api-and-interface-design, security-and-hardening,
performance-optimization, source-driven-development, documentation-and-adrs (P2+);
planning-and-task-breakdown (P3); incremental-implementation, test-driven-development,
frontend-ui-engineering, browser-testing-with-devtools (P4); code-review-and-quality (end of
every phase, before every push); git-workflow-and-versioning (always); shipping-and-launch (P6).
Do not use: interview-me, constraint/doubt-driven-development, context-engineering,
code-simplification, debugging-and-error-recovery, observability, deprecation-and-migration.

## Precedence (this file beats any skill)
- Visual style is "Stationery Desk" (tokens in SPEC). Overrides generic design guidance.
- No one-at-a-time interviewing. Questions only on blocking decisions, max 4 per round.
- Forbidden: analytics, error-tracking vendors, A/B tools, any third-party script (children's data).
- Anything needing a paid service or real backend: stub behind an interface, label "Preview".
- CI: one minimal GitHub Actions workflow (lint, typecheck, test, build, bundle-size). Nothing more.

## Three-tier boundary
- Always: validate inputs at boundaries; escape on output; test logic before shipping; keep demo
  data labelled "Demo data".
- Ask first: new dependencies; any network call other than the app's own origin; schema changes;
  anything that stores personal data off-device.
- Never: commit secrets; add analytics or trackers; send children's data anywhere; auto-send
  messages; remove or skip a failing test to make the suite pass; use dangerouslySetInnerHTML.

## Honesty rules
All numbers/names are demo data and labelled. Simulated features (AI handwriting, WhatsApp send,
OTP, payments, auto-translate) are labelled Preview. Teacher can override every mark. One wrong
answer is not a gap (gap rules in SPEC). No invented stats, quotes or testimonials.

## Engineering habits
- TDD for logic (red/green/refactor). Prefer fakes over mocks. One concept per test.
- Every UI string in en + hi translation files; a parity test fails on missing keys.
- Thin vertical slices; project builds between slices; commits under ~300 changed lines, atomic,
  never mixing refactor and feature. Out-of-scope issues -> "NOTICED BUT NOT TOUCHING" in tasks/todo.md.
- Git: all work on branch claude/friendly-bell-d1p91z (owner decision, overrides feat/ branches and PR-per-slice). PR into main only when asked.
- Deploy: Vercel at Phase 6, after CHECKPOINT 4 approval. Name "Mento" kept; keep it in one constant (trademark check pending).
- Originality: inspired by principles of "Kaksha" only; never copy its OMR theme, layout, names
  (Pro, Campus), XP/streaks, copy, colours or North Star phrase.
