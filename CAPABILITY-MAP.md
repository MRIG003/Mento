# Capability Map: Mento v1

Status: **Approved (2026-11-03).**
Skill: spec-driven-development, Phase 0 scope check.

Mento bundles several capabilities that can each be tested on their own, with their own consumers and data.
This map fixes the module ids, the direction of dependencies and the build order. Module ids are stable:
specs are named `SPEC-<id>.md` and tasks reference these ids.

## Modules

| Module id | Responsibility | Depends on |
|---|---|---|
| `foundation` | Stationery Desk design tokens (CSS vars + Tailwind theme), self-hosted fonts, app shell, per-role tab bars, top bar with the `EN \| हिं` switch, i18n runtime (en/hi catalogues, key-parity test, `html lang`), UI primitives (Button, StickyNote, WashiTape, NameTag, HighlighterMark, ProgressBar, "Demo data" / "Preview" badges, CoachMark, EmptyState, PaperSkeleton) | none |
| `domain` | Pure TypeScript, no I/O. Entity schemas and types (School, Teacher, Class, Student, Subject, Concept, Question, Homework, Submission, Evaluation, GapFlag, PracticeSet, Consent, Reminder), token generation, answer normalisation (NFC, zero-width, Devanagari digits, spacing, variants), auto-check per question type, late tagging, **gap rules**, misconception detection, practice selection, re-check delta, Evening Wrap computation, principal aggregates, CSV escaping | none |
| `data` | Repository interfaces and the local implementation (localStorage/IndexedDB), schema version and migrations, parse-on-read, seed data (school, 3 classes, 40-student 6B Fractions submissions, Class 6 Maths bank, Class 5 Hindi sample), the demo submission wave, demo reset, and **role-scoped access**: `TeacherScope` (own classes), `StudentLinkScope` (one token, own work), `PrincipalScope` (aggregates only, enforced here and not in the UI) | `domain` |
| `services` | Contracts and labelled-Preview mocks for OtpService, ShareService (builds a wa.me URL and never auto-sends), HandwritingReader, AutoTranslate, PaymentsService, SyncService (multi-device, Preview) | `domain` |
| `homework` | Create flow: class/chapter, bank picker, own questions with bilingual fields and "Add other language" / Auto-translate (Preview), types (MCQ, number/fill-in, short answer, photo, paper), due date, reuse last, save as template, preview as student, publish, share link and WhatsApp composer | `foundation`, `data`, `services` |
| `student-link` | Link landing (`/h/{token}`, `/join/{token}`), language choice, pick own name and confirm, consent line, warm-up question, one question per screen, local save as typed, edit until the deadline, late tag, success stamp; Today / Practice / My progress tabs | `foundation`, `data` |
| `insights` | Teacher Results tab: Review (flagged items, override, paper-fallback marks grid) and Concepts (highlighter heatmap, evidence and likely misconception, Needs help tags, "not enough evidence"); one-tap practice draft → teacher approve → publish; re-check view | `foundation`, `data` |
| `capture` | Guided photo capture: getUserMedia lifecycle, **pure quality heuristics over ImageData** (luminance, Laplacian blur, framing, steadiness, glare), one message at a time, auto-capture, torch, retake reason, EXIF-free compression, file-picker fallback, "needs teacher review"; HandwritingReader result is Preview. Lazy-loaded. | `foundation`, `data`, `services` |
| `family` | Parent report (understood / getting there / not yet, by concept, in the chosen language), "remind pending parents" composer (opens wa.me, never sends), the teacher's single daily summary | `foundation`, `data`, `services` |
| `principal` | Principal tabs Overview / Gaps / Classes / Plan: aggregates only, plain-sentence headline, class × subject gap heatmap, Indian number formatting, lock rule (3+ active teachers or upgrade) with a labelled preview, Free vs School plan screen (₹200-400 shown as an assumption), Payments (Preview). Lazy-loaded. | `foundation`, `data`, `services` |
| `privacy` | Consent status per student, CSV export (formula-injection safe, scope-limited), delete flow, the "what we keep and for how long" screen, settings (text size, sound/haptics) | `foundation`, `data` |
| `onboarding` | Role chooser, teacher path (OTP Preview → name/school → first class → roster join link or paste list → consent setup → first-homework mission → preview → share → demo wave → first insight → first practice), principal path (school code → explainer → demo dashboard → lock explainer → invite), coach-mark tours per screen + Help replay, demo mode (badge, script overlay, Reset demo). Lazy-loaded tours. | `foundation`, `data`, `services` |
| `desk` | Teacher home: sticky notes ordered by next action, Evening Wrap, Starter Checklist with stickers (hidden when done), "Done today" tray | `foundation`, `data` |

## Dependency rules

- Arrows point one way: `foundation`, `domain` → `data`, `services` → feature modules. There are no cycles.
- **Feature modules never import each other.** They connect through routes (URLs) and shared state in `data`.
  Example: onboarding opens `/t/create?mission=1`, which homework reads; the checklist progress is a `data`
  record written by onboarding and rendered by desk.
- Only `data` touches storage. UI code never calls localStorage or IndexedDB directly, so Supabase can replace the
  local adapter without touching UI.
- Role boundaries are enforced in `data` scopes. `PrincipalScope` cannot return student-level rows.
- Each module exposes a public `index.ts`. Deep imports into another module's internals are not allowed.

## Build order (maps onto the requested slices, risk-first)

```
1. foundation                       (slice 1)
2. domain + data + services         (slice 2; Devanagari matching and gap rules TDD'd here, early)
   └─ capture heuristics (pure fns) pulled forward into slice 2b. They are the least certain piece.
3. onboarding (teacher path) + desk (checklist)          (slice 3)
4. homework                                              (slice 4)
5. student-link                                          (slice 5)
6. insights                                              (slice 6)
7. insights (practice) + family                          (slice 7)
8. capture (UI around the heuristics from 2b)            (slice 8)
9. onboarding (principal path) + principal               (slice 9)
10. privacy + onboarding (demo mode)                     (slice 10)
11. polish across modules                                (slice 11)
```

## Changes from the suggested starting list, and why

- **Split `domain` out of `data`.** All rules (checking, gaps, aggregates) become pure and testable with no
  storage, and both `data` scopes and the UI can use them without a cycle.
- **Added `services`.** The simulated services each get one contract and a mock labelled Preview, kept in one place.
- **Moved "check" out of `insights` into `domain`.** Auto-check is used by the student link (warm-up,
  practice), by homework preview and by insights, so it must not live in a feature module.
- **Added `family`** for the parent report and reminders: different consumers (parents) and a different language
  per recipient.
- **Added `desk`** as its own module: the signature home combines several sources, and keeping it separate stops
  onboarding or insights from owning it.
- Kept demo mode inside `onboarding` as suggested.

## Spec files that will follow approval

`SPEC.md` (shared: objective, stack, commands, structure, style, testing, boundaries, budgets, success
criteria) plus one short `SPEC-<id>.md` per module above, `docs/threat-model.md`, and ADRs in
`docs/decisions/`.
