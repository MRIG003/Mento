# Implementation Plan: Mento v1

Status: **Approved at CHECKPOINT 3 (2026-11-03).** Task list with checkboxes: [todo.md](todo.md).

## Context
Spec set approved at CHECKPOINT 2 (SPEC.md, SPEC-<id>.md ×13, docs/threat-model.md, ADR-001..012, CAPABILITY-MAP.md).
The repo has docs only, no code yet. This plan breaks the build into vertical, verifiable tasks of about 5 source files each,
risk-first, with checkpoints every 2-3 tasks. **Approving this plan = CHECKPOINT 3.** On approval I write this content
to `tasks/plan.md` (overview, graph, risks, checkpoints) and `tasks/todo.md` (the task list below in the skill's format,
plus a "NOTICED BUT NOT TOUCHING" section), commit, and start Phase 4 slice 1.

## Dependency graph
```
T1 tooling ─► T2 app skeleton+CSP ─► T3 test harness ─► T4 CI+bundle check
                     │
                     ├─► T5 tokens+fonts ─► T6 i18n ─► T7 shell+switch ─► T8-T10 primitives
                     │
T11 domain types ─► T12 checking ─► T13 gap rules ─► T14 practice/wrap/aggregates/csv
T15 capture heuristics (pure, independent; risk-first)
T11 ─► T16 storage+migrations ─► T17 blobs ─► T18 seed ─► T19-T20 scopes ─► T22 React data hooks
T11 ─► T21 services
      (T7..T10, T22) ─► feature slices 3-10 ─► slice 11 polish ─► Phase 5 verify ─► Phase 6 ship
```
Feature tasks depend only on foundation + data/services (ADR-011), so the slice order below is a choice, not a forced one.

## Per-task loop (every task; from the approved prompt §15 Phase 4)
Read task + spec section → check docs for any unfamiliar API (Next docs in `node_modules/next/dist/docs`; Tailwind, Vitest,
Playwright, MDN via Firecrawl when needed) → contract first → RED test → GREEN → refactor → UI states (loading/empty/error) +
a11y → en+hi strings (parity test) → security pass against the threat model → Playwright check at 390 px in en+hi (screenshot,
console clean, no overflow) → `npm run check` → five-axis self-review (tests first) → atomic commit(s) < ~300 lines → push →
≤ 5-line report. Commands are those in SPEC §3 once T1-T4 verify them.

## Task list (Files = main source files; co-located `*.test.ts(x)` implied)

### Slice 1: Foundation (theme, shell, i18n, language switch)
- **T1 Tooling scaffold.** Acceptance: `npm ci` works from the lockfile; versions pinned exactly as in SPEC §2; `npm run lint` and
  `npm run typecheck` pass on an empty src. Verify: run both. Files: `package.json`, `.npmrc` (save-exact, no-fund), `tsconfig.json`
  (strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, `@/*`), `eslint.config.mjs` (next + jsx-a11y + no-restricted-imports
  for module boundaries + ban dangerouslySetInnerHTML + jsx-no-literals), `postcss.config.mjs`.
- **T2 App skeleton + security headers.** Acceptance: `npm run build` produces static routes; the response carries every header from
  threat-model §4; **ADR-008 verified**: the page hydrates with no CSP violations under `script-src 'self'` + SRI, or the fallback is applied
  and the ADR is updated with evidence. Verify: `next start` + Playwright console capture + `curl -I`. Files: `next.config.ts`, `src/app/layout.tsx`,
  `src/app/page.tsx` (placeholder), `src/app/globals.css`.
- **T3 Test harness.** Acceptance: `npm test` runs one sample unit test (node) and one component test (jsdom); `npm run e2e` runs a 390 px smoke
  test against the build using the preinstalled Chromium. Verify: both commands green. Files: `vitest.config.mts`, `vitest.setup.ts`,
  `playwright.config.ts`, `e2e/smoke.spec.ts`.
- **T4 Bundle budget + CI.** Acceptance: `npm run size` reads the build output, gzips first-load JS per route and fails above the SPEC §8 budgets;
  `.github/workflows/ci.yml` runs `npm ci` + `npm run check` (+ e2e) on push. Verify: run size locally; deliberately lower one budget → fails.
  Files: `scripts/check-bundle.mjs`, `scripts/budgets.json`, `.github/workflows/ci.yml`.
- **Checkpoint A (T1-T4):** check green; headers and CSP decision recorded; commands in CLAUDE.md + SPEC §3 updated to "verified".
- **T5 Design tokens + fonts.** Acceptance: all SPEC-foundation tokens in `@theme`; dot-grid paper body; Nunito/Caveat/Noto Sans Devanagari
  self-hosted (Latin + Devanagari woff2 only, `display: swap`); contrast test passes (ink, muted, white-on-primary ≥ 4.5:1); reduced-motion rule.
  Verify: unit test + screenshot. Files: `src/app/globals.css`, `src/fonts/*` (copied from @fontsource), `src/modules/foundation/fonts.ts`,
  `src/modules/foundation/tokens.ts`.
- **T6 i18n runtime.** Acceptance: `t()` with params and plurals; `hi` typed against `en` keys (a missing key is a compile error); a runtime
  parity + placeholder test; provider sets `html[lang]`, persists the pref, resolves fragment → pref → navigator → en. Verify: unit + component
  tests. Files: `src/i18n/en.ts`, `src/i18n/hi.ts`, `src/modules/foundation/i18n/{t.ts,provider.tsx,resolve-lang.ts}`.
- **T7 Shell + LanguageSwitch.** Acceptance: TopBar with `EN | हिं` (≥ 44 px, aria-pressed), Help and Demo badge slots; TabBar per role
  (Teacher Desk/Create/Results/Class, Principal 4, Student 3); switching keeps a typed value, focus and scroll (component test); no overflow at 390 px
  in en+hi (e2e). Files: `foundation/components/{LanguageSwitch,TopBar,TabBar}.tsx`, `foundation/icons.tsx`, `src/app/t/layout.tsx` (+ p, h layouts).
- **Checkpoint B (T5-T7).**
- **T8 Primitives A:** Button (pill 56 px), StickyNote + WashiTape, Card, Badge (DemoData/Preview/Late), StatusWord. Acceptance: states + keyboard
  tests; the flagship look renders in a dev-only `/dev/kit` page (excluded from prod build output via a notFound() guard).
- **T9 Primitives B:** NameTag (deterministic tint/rotation from id), HighlighterMark, ProgressBar (bar + % + word), Fraction (accessible label
  en/hi), EmptyState, PaperSkeleton.
- **T10 Primitives C + route states:** CoachMark (max 4, focus trap, Esc, returns focus), Sheet (dialog), Field (label/hint/error via
  aria-describedby); `src/app/{error,not-found,loading}.tsx` bilingual.
- **Checkpoint C (T8-T10):** kit page screenshots en+hi at 390 px; axe-style checks pass. *Slice 1 done.*

### Slice 2: Domain, data, services (risk-first: Devanagari matching, gap rules, photo heuristics)
- **T11 Domain types + schemas.** zod schemas for all 14 entities + `Result`/`AppError`/branded ids/`Clock`/`RandomSource`; `generateToken`
  (16 bytes, base64url, 22 chars). Acceptance: 10k tokens are unique with the right length/alphabet; invalid entities rejected. Files:
  `domain/{schemas.ts,types.ts,result.ts,token.ts,index.ts}`.
- **T12 Answer checking.** `normaliseAnswer` (NFC, zero-width, ०-९, spaces, trailing danda, loose ँ→ं & nukta), `checkAnswer` (mcq/fill/
  numeric/short/photo), `tagLateness`. Acceptance: the required tests in SPEC §6 (each type, variants, Devanagari, late at the exact due time).
  Files: `domain/lib/{normalise.ts,check.ts,lateness.ts}`.
- **T13 Gap rules.** `studentConceptStatus`, `classConceptStatus`, `reportBand`, attempt counting with overrides, `detectMisconceptions`,
  `recheckDelta`. Acceptance: boundary tests 1/2 attempts, 49/50%, 59/60%, 2/3 attempts; the ≥ 2 rule for distractors. Files: `domain/lib/{gap-rules.ts,evidence.ts,misconceptions.ts,recheck.ts}`.
- **Checkpoint D (T11-T13):** domain coverage ≥ 95%.
- **T14 Practice, wrap, aggregates, CSV.** `selectPractice`, `buildEveningWrap`, `schoolAggregates` (type test: no ids/names), `isDashboardUnlocked`,
  `escapeCsvCell`/`toCsv`, `formatIndianNumber`. Files: `domain/lib/{practice.ts,wrap.ts,aggregates.ts,csv.ts,format.ts}`.
- **T15 Photo-quality heuristics (2b).** Pure `assess(frame, prev)` + luminance/glare/Laplacian/diff/Sobel-bbox, issue priority, auto-capture
  counter; synthetic ImageData generators (dark, glare, blurred, shaky, sharp-framed, cropped). Acceptance: each synthetic case yields the
  expected issue/ok; thresholds in one file; ADR-003 updated with calibrated values. Files: `capture/lib/{quality.ts,thresholds.ts,auto-capture.ts}`,
  `capture/lib/test-images.ts`.
- **T16 Storage driver + versioning.** `StorageDriver` (localStorage + in-memory fake), envelope, v1→v2 migration, zod parse-on-read, quarantine,
  serialised writes, `storage`-event subscription. Acceptance: migration fixture, corrupt-value quarantine, quota error → `STORAGE`. Files:
  `data/storage/{driver.ts,local-driver.ts,memory-driver.ts,envelope.ts,migrations.ts}`.
- **Checkpoint E (T14-T16).**
- **T17 BlobStore.** IndexedDB wrapper (put/get/delete) + fake-indexeddb tests. Files: `data/storage/blob-store.ts`.
- **T18 Seed + bank.** School, 4 teachers, 3 classes, rosters; the Class 6 Maths bilingual bank (fractions, decimals, geometry; ≥ 6 per concept,
  misconception-tagged distractors); the Class 5 Hindi grammar sample; 6B Fractions submissions generated relative to the clock. Acceptance: a test
  runs the **real rules** over the seed → exactly 6 stuck on Comparing fractions; all records parse. Files: `data/seed/{school.ts,bank-maths-6.ts,hindi-5.ts,submissions-6b.ts,index.ts}`.
- **T19 TeacherScope.** All methods in SPEC-data with ownership checks; `getResults` composes the domain rules; overrides and paper marks.
  Acceptance: FORBIDDEN across teachers; override changes results. Files: `data/scopes/{teacher.ts,results.ts}`.
- **Checkpoint F (T17-T19).**
- **T20 StudentLinkScope + PrincipalScope + factory + demo.** No answer keys in `LinkContext`; first names only after a valid token; principal runtime
  key allowlist; `createLocalRepositories`; demo seed/reset/submission wave (seeded RNG). Files: `data/scopes/{student-link.ts,principal.ts}`,
  `data/{repositories.ts,demo.ts,index.ts}`.
- **T21 Preview services.** OTP, Share (real wa.me), HandwritingReader, AutoTranslate, Payments, Sync per SPEC-services. Files:
  `services/{otp.ts,share.ts,reader.ts,translate.ts,payments.ts}` + `index.ts`.
- **T22 React data bindings.** `RepositoriesProvider`, `useScope`, `useLive(query)` (re-runs on storage events), `ServicesProvider`; app-level
  provider wiring. Acceptance: a teacher tab updates when a student tab submits (two-provider test on a shared fake driver). Files:
  `data/react/{provider.tsx,use-live.ts}`, `services/react.tsx`, `src/app/providers.tsx`.
- **Checkpoint G (T20-T22):** full `npm run check`. *Slice 2 done.*

### Slice 3: Teacher onboarding + roster + Starter Checklist
- **T23 Role chooser `/`** (3 cards, language visible, "Try with a demo class", link-paste help). Files: `onboarding/screens/RoleChooser.tsx`, `src/app/page.tsx`.
- **T24 Teacher onboarding steps 1-5.** Progress state machine (skip/resume), OTP Preview, name/school, first class, roster (join link / paste ≤ 80
  names / demo class), consent explainer. Files: `onboarding/lib/progress.ts`, `onboarding/screens/{TeacherStart,StepOtp,StepClass,StepRoster}.tsx`, `src/app/start/teacher/page.tsx`.
  *(Split into T24a steps 1-3 and T24b roster+consent if it exceeds ~5 files.)*
- **T25 Desk shell + Starter Checklist.** `/t` with empty state, checklist with 5 steps, stickers (inline SVG), celebrations; hides at 5/5.
  Files: `desk/screens/Desk.tsx`, `desk/components/{StarterChecklist,Sticker}.tsx`, `src/app/t/page.tsx`.
- **Checkpoint H (T23-T25):** e2e: `/` → teacher → class → desk shows checklist with 1-2 done, en+hi.

### Slice 4: Create homework + share
- **T26 Create flow core:** class/chapter, 5 suggested bank questions preselected, due default, publish; `?mission=1` prefill. Files:
  `homework/screens/Create.tsx`, `homework/components/{BankPicker,DuePicker}.tsx`, `homework/lib/suggest.ts`, `src/app/t/create/page.tsx`.
- **T27 Own-question editor:** types MCQ/fill/short/photo, bilingual tabs, variants chips, concept tag, limits, Auto-translate (Preview). Files:
  `homework/components/{QuestionEditor,OptionList,VariantChips,BilingualField}.tsx`.
- **T28 Share sheet + reuse/template:** message templates en/hi, wa.me, copy, native share; reuse last; save/use template. Acceptance: ≤ 4 taps
  Desk → shared (e2e). Files: `homework/components/ShareSheet.tsx`, `homework/lib/{message.ts,reuse.ts}`.
- **Checkpoint I (T26-T28).**

### Slice 5: Student/parent link + consent + offline
- **T29 Link entry:** fragment parse (zod), invalid-link screen, language picker, name pick + "Not me", consent line, warm-up. Files:
  `student-link/lib/fragment.ts`, `student-link/screens/{LinkEntry,PickName,Consent,WarmUp}.tsx`, `src/app/h/page.tsx`.
- **T30 Question player:** one per screen, MCQ radios/fill/short inputs, autosave per change, progress dots, skip/back; the language switch keeps the
  answer. Files: `student-link/screens/Player.tsx`, `student-link/components/{McqInput,TextAnswer,ProgressDots}.tsx`.
- **T31 Submit + after:** review list, submit, late tag, success stamp, edit until deadline, Today/Practice/My progress tabs (practice/progress
  filled in slice 7); teacher "Preview as student" (`#preview=`). Files: `student-link/screens/{Review,Success,Tabs}.tsx`.
- **Checkpoint J (T29-T31):** e2e student path en+hi; reload restores answers; bundle ≤ 150 KB.
- **T32 `/join` self-join + pending names** (teacher approves in Class). Files: `student-link/screens/Join.tsx`, `src/app/join/page.tsx`, `desk`-independent Class roster approve UI in `src/app/t/class/page.tsx` (minimal).
- **T33 PWA:** `app/manifest.ts`, `public/sw.js`, registration component, sw headers; e2e offline reopen of `/h`. Files: 4.

### Slice 6: Auto-check, review, insights, gap rules
- **T34 Results list + Concepts view (flagship).** Sticky headline, CONCEPTS card with highlighter, evidence, misconception, NEEDS HELP tags,
  practice CTA, Demo data label; "not enough answers yet" states. Files: `insights/screens/{ResultsList,Concepts}.tsx`, `insights/components/{ConceptRow,NeedsHelp}.tsx`, `src/app/t/results/page.tsx`.
- **T35 Review + override + paper marks grid** (keyboard arrows). Files: `insights/screens/Review.tsx`, `insights/components/{ReviewItem,PaperGrid}.tsx`.
- **T36 Mission finale:** onboarding publish → demo submission wave (animated tags; instant with reduced motion) → first insight → checklist step 4.
  Files: `onboarding/screens/MissionWave.tsx`, `onboarding/lib/mission.ts`.
- **Checkpoint K (T34-T36):** the flagship screen matches the look target (screenshot en+hi); the seed headline is computed.

### Slice 7: Practice, parent report, reminders, Evening Wrap
- **T37 Practice:** draft sheet, swap/remove, approve + share; Practice tab on `/h`; re-check view; checklist step 5. Files:
  `insights/screens/{PracticeDraft,Recheck}.tsx`, `student-link/screens/PracticeTab.tsx`.
- **T38 Parent report:** bands on `/h` My progress + teacher Class view. Files: `family/components/ReportCard.tsx`, `family/screens/ClassReport.tsx`, `student-link/screens/ProgressTab.tsx`.
- **T39 Reminders + daily summary + desk notes:** remind composer, Reminder record, desk note ordering, Evening Wrap note. Files:
  `family/components/RemindComposer.tsx`, `desk/lib/notes.ts`, `desk/components/{Note,EveningWrap}.tsx`.
- **Checkpoint L (T37-T39):** the full teacher loop e2e in < 3 min scripted; en+hi.

### Slice 8: Guided photo capture (Preview reading)
- **T40 Camera screen:** tap-to-start, lifecycle cleanup, frame sampling ≤ 5 fps, one live message, auto-capture, torch, lens tip; lazy-loaded.
  Files: `capture/screens/Capture.tsx`, `capture/hooks/{useCamera,useFrameAssessment}.ts`.
- **T41 After capture:** score words + retake reason, re-encode (EXIF stripped, ≤ 1600 px), file-picker fallback with magic-byte check, BlobStore,
  photo question in the player, Review shows the reader (Preview) suggestion. Files: `capture/lib/{encode.ts,file-check.ts}`, `capture/components/PhotoResult.tsx`, `student-link/components/PhotoAnswer.tsx`.
- **Checkpoint M (T40-T41):** tested with a fake camera stream in Playwright (`--use-fake-device-for-media-stream`).

### Slice 9: Principal
- **T42 Principal onboarding** (school code, explainer, lock explainer, invite composer). Files: `onboarding/screens/{PrincipalStart,PrincipalExplainer}.tsx`, `src/app/start/principal/page.tsx`.
- **T43 Overview + lock:** headline, tiles, Indian formatting, lock state with count; lazy route. Files: `principal/screens/Overview.tsx`, `principal/components/{Tile,LockPanel}.tsx`, `src/app/p/page.tsx`.
- **T44 Gaps heatmap (SVG, keyboard) + Classes + Plan (Preview trial/upgrade).** Files: `principal/screens/{Gaps,Classes,Plan}.tsx`, `src/app/p/{gaps,classes,plan}/page.tsx`.
- **Checkpoint N (T42-T44).**

### Slice 10: Privacy, settings, demo mode
- **T45 `/privacy` "what we keep" + consent status + CSV export.** Files: `privacy/screens/{WhatWeKeep,ConsentStatus}.tsx`, `privacy/lib/export.ts`, `src/app/privacy/page.tsx`.
- **T46 Delete flows + settings** (text size, sound/haptics off by default, demo toggle). Files: `privacy/screens/{DeleteData,Settings}.tsx`, `src/app/t/settings/page.tsx`.
- **T47 Demo mode + tours:** badge, script overlay (lazy, `?` key), Reset demo, coach-mark tours per screen, Help replay. Files: `onboarding/screens/DemoOverlay.tsx`, `onboarding/lib/tours.ts`, `foundation`-level Help wiring.
- **Checkpoint O (T45-T47).**

### Slice 11: Polish
- **T48 Motion pass** (peel, swipe, tag drop; reduced-motion verified). **T49 Microcopy pass** en+hi (natural Hindi; list for native review).
- **T50 Accessibility pass** (keyboard, focus, labels, contrast, screen-reader names on icon buttons). **T51 Hindi layout pass** (e2e on every route ×
  both languages at 390 px: no overflow, no clipped matras via line-height checks, screenshots).
- **Checkpoint P:** ready for Phase 5.

Phase 5 (verify) and Phase 6 (ship, CHECKPOINT 4 before the production deploy) follow the prompt as written; they're listed in tasks/plan.md as closing phases.

## Risks and mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| SRI CSP blocks Next's inline bootstrap | Med | Verified in T2 first; documented fallback (ADR-008) |
| Photo heuristics unreliable on real phones | High | Pure functions + synthetic tests early (T15); thresholds in one file; manual shutter + "submit anyway" |
| Hindi matching edge cases (nukta, matras, digits) | High | T12 is test-first with a variant table; teacher variants override |
| Student route over 150 KB | Med | `zod/mini`, lazy capture, size check in CI from T4 |
| Single-device demo misread as real sync | High | Preview: sync label + README; in-app note on share sheet |
| WhatsApp in-app browser storage/camera quirks | Med | Not testable here; documented as unverified, "Open in Chrome" hint |
| Docs sites blocked from the container | Low | Bundled Next docs; Firecrawl for Tailwind/Vitest/MDN; mark "unverified" otherwise |
| Scope size (51 tasks) | Med | Strict slice order; NOTICED BUT NOT TOUCHING list; each slice shippable |

## Verification (end-to-end)
Per task: `npm run check` + targeted Playwright at 390 px en+hi. Per checkpoint: full e2e suite + screenshots. Final: Phase 5 runs
every flow as teacher/principal/student in both languages, Lighthouse on throttled slow 4G + 4× CPU → `docs/perf.md`, `npm audit`, header check.
