# Mento v1: task list

Source: [plan.md](plan.md). Format per planning-and-task-breakdown. Tick a box only after its verify step passes.
Default verify for every task: `npm run check` green + Playwright check at 390 px in en and hi (screenshot, console clean, no overflow).

## Slice 1: Foundation (theme, shell, i18n, language switch)

- [x] **T1: Tooling scaffold**
  - Acceptance: `npm ci` works from the lockfile; versions pinned exactly as in SPEC §2; `npm run lint` and `npm run typecheck` pass on an empty src.
  - Verify: run both.
  - Files: `package.json`, `.npmrc` (save-exact, no-fund), `tsconfig.json` (strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, `@/*`), `eslint.config.mjs` (next + jsx-a11y + no-restricted-imports for module boundaries + ban dangerouslySetInnerHTML + jsx-no-literals), `postcss.config.mjs`.

- [x] **T2: App skeleton + security headers**
  - Acceptance: `npm run build` produces static routes; the response carries every header from threat-model §4; **ADR-008 verified**: the page hydrates with no CSP violations under `script-src 'self'` + SRI, or the fallback is applied and the ADR is updated with evidence.
  - Verify: `next start` + Playwright console capture + `curl -I`.
  - Files: `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx` (placeholder), `src/app/globals.css`.

- [x] **T3: Test harness**
  - Acceptance: `npm test` runs one sample unit test (node) and one component test (jsdom); `npm run e2e` runs a 390 px smoke test against the build using the preinstalled Chromium.
  - Verify: both commands green.
  - Files: `vitest.config.mts`, `vitest.setup.ts`, `playwright.config.ts`, `e2e/smoke.spec.ts`.

- [x] **T4: Bundle budget + CI**
  - Acceptance: `npm run size` reads the build output, gzips first-load JS per route and fails above the SPEC §8 budgets; `.github/workflows/ci.yml` runs `npm ci` + `npm run check` (+ e2e) on push.
  - Verify: run size locally; deliberately lower one budget → fails.
  - Files: `scripts/check-bundle.mjs`, `scripts/budgets.json`, `.github/workflows/ci.yml`.

- [x] **Checkpoint A (T1-T4)** check green; headers and CSP decision recorded; commands in CLAUDE.md + SPEC §3 updated to "verified".
  - [x] All tests pass, build clean, size budget met
  - [x] Flow so far works end to end in en and hi

- [x] **T5: Design tokens + fonts**
  - Acceptance: all SPEC-foundation tokens in `@theme`; dot-grid paper body; Nunito/Caveat/Noto Sans Devanagari self-hosted (Latin + Devanagari woff2 only, `display: swap`); contrast test passes (ink, muted, white-on-primary ≥ 4.5:1); reduced-motion rule.
  - Verify: unit test + screenshot.
  - Files: `src/app/globals.css`, `src/fonts/*` (copied from @fontsource), `src/modules/foundation/fonts.ts`, `src/modules/foundation/tokens.ts`.

- [x] **T6: i18n runtime**
  - Acceptance: `t()` with params and plurals; `hi` typed against `en` keys (a missing key is a compile error); a runtime parity + placeholder test; provider sets `html[lang]`, persists the pref, resolves fragment → pref → navigator → en.
  - Verify: unit + component tests.
  - Files: `src/i18n/en.ts`, `src/i18n/hi.ts`, `src/modules/foundation/i18n/{t.ts,provider.tsx,resolve-lang.ts}`.

- [x] **T7: Shell + LanguageSwitch**
  - Acceptance: TopBar with `EN | हिं` (≥ 44 px, aria-pressed), Help and Demo badge slots; TabBar per role (Teacher Desk/Create/Results/Class, Principal 4, Student 3); switching keeps a typed value, focus and scroll (component test); no overflow at 390 px in en+hi (e2e).
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `foundation/components/{LanguageSwitch,TopBar,TabBar}.tsx`, `foundation/icons.tsx`, `src/app/t/layout.tsx` (+ p, h layouts).

- [x] **Checkpoint B (T5-T7).**
  - [x] All tests pass, build clean, size budget met
  - [x] Flow so far works end to end in en and hi

- [x] **T8: Primitives A**
  - Description: Button (pill 56 px), StickyNote + WashiTape, Card, Badge (DemoData/Preview/Late), StatusWord.
  - Acceptance: states + keyboard tests; the flagship look renders in a dev-only `/dev/kit` page (excluded from prod build output via a notFound() guard).
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: listed in plan.md

- [x] **T9: Primitives B**
  - Description: NameTag (deterministic tint/rotation from id), HighlighterMark, ProgressBar (bar + % + word), Fraction (accessible label en/hi), EmptyState, PaperSkeleton.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: listed in plan.md

- [x] **T10: Primitives C + route states**
  - Description: CoachMark (max 4, focus trap, Esc, returns focus), Sheet (dialog), Field (label/hint/error via aria-describedby); `src/app/{error,not-found,loading}.tsx` bilingual.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: listed in plan.md

- [x] **Checkpoint C (T8-T10)** kit page screenshots en+hi at 390 px; axe-style checks pass. *Slice 1 done.*
  - [x] All tests pass, build clean, size budget met
  - [x] Flow so far works end to end in en and hi


## Slice 2: Domain, data, services (risk-first: Devanagari matching, gap rules, photo heuristics)

- [x] **T11: Domain types + schemas**
  - Description: zod schemas for all 14 entities + `Result`/`AppError`/branded ids/`Clock`/`RandomSource`; `generateToken` (16 bytes, base64url, 22 chars).
  - Acceptance: 10k tokens are unique with the right length/alphabet; invalid entities rejected.
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `domain/{schemas.ts,types.ts,result.ts,token.ts,index.ts}`.

- [x] **T12: Answer checking**
  - Description: `normaliseAnswer` (NFC, zero-width, ०-९, spaces, trailing danda, loose ँ→ं & nukta), `checkAnswer` (mcq/fill/ numeric/short/photo), `tagLateness`.
  - Acceptance: the required tests in SPEC §6 (each type, variants, Devanagari, late at the exact due time).
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `domain/lib/{normalise.ts,check.ts,lateness.ts}`.

- [x] **T13: Gap rules**
  - Description: `studentConceptStatus`, `classConceptStatus`, `reportBand`, attempt counting with overrides, `detectMisconceptions`, `recheckDelta`.
  - Acceptance: boundary tests 1/2 attempts, 49/50%, 59/60%, 2/3 attempts; the ≥ 2 rule for distractors.
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `domain/lib/{gap-rules.ts,evidence.ts,misconceptions.ts,recheck.ts}`.

- [x] **Checkpoint D (T11-T13)** domain coverage ≥ 95%.
  - [x] All tests pass, build clean, size budget met
  - [x] Flow so far works end to end in en and hi

- [x] **T14: Practice, wrap, aggregates, CSV**
  - Description: `selectPractice`, `buildEveningWrap`, `schoolAggregates` (type test: no ids/names), `isDashboardUnlocked`, `escapeCsvCell`/`toCsv`, `formatIndianNumber`.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `domain/lib/{practice.ts,wrap.ts,aggregates.ts,csv.ts,format.ts}`.

- [x] **T15: Photo-quality heuristics (2b)**
  - Description: Pure `assess(frame, prev)` + luminance/glare/Laplacian/diff/Sobel-bbox, issue priority, auto-capture counter; synthetic ImageData generators (dark, glare, blurred, shaky, sharp-framed, cropped).
  - Acceptance: each synthetic case yields the expected issue/ok; thresholds in one file; ADR-003 updated with calibrated values.
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `capture/lib/{quality.ts,thresholds.ts,auto-capture.ts}`, `capture/lib/test-images.ts`.

- [x] **T16: Storage driver + versioning**
  - Description: `StorageDriver` (localStorage + in-memory fake), envelope, v1→v2 migration, zod parse-on-read, quarantine, serialised writes, `storage`-event subscription.
  - Acceptance: migration fixture, corrupt-value quarantine, quota error → `STORAGE`.
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `data/storage/{driver.ts,local-driver.ts,memory-driver.ts,envelope.ts,migrations.ts}`.

- [x] **Checkpoint E (T14-T16).**
  - [x] All tests pass, build clean, size budget met
  - [x] Flow so far works end to end in en and hi

- [x] **T17: BlobStore**
  - Description: IndexedDB wrapper (put/get/delete) + fake-indexeddb tests.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `data/storage/blob-store.ts`.

- [x] **T18: Seed + bank**
  - Description: School, 4 teachers, 3 classes, rosters; the Class 6 Maths bilingual bank (fractions, decimals, geometry; ≥ 6 per concept, misconception-tagged distractors); the Class 5 Hindi grammar sample; 6B Fractions submissions generated relative to the clock.
  - Acceptance: a test runs the **real rules** over the seed → exactly 6 stuck on Comparing fractions; all records parse.
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `data/seed/{school.ts,bank-maths-6.ts,hindi-5.ts,submissions-6b.ts,index.ts}`.

- [x] **T19: TeacherScope**
  - Description: All methods in SPEC-data with ownership checks; `getResults` composes the domain rules; overrides and paper marks.
  - Acceptance: FORBIDDEN across teachers; override changes results.
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `data/scopes/{teacher.ts,results.ts}`.

- [x] **Checkpoint F (T17-T19).**
  - [x] All tests pass, build clean, size budget met
  - [x] Flow so far works end to end in en and hi

- [x] **T20: StudentLinkScope + PrincipalScope + factory + demo**
  - Description: No answer keys in `LinkContext`; first names only after a valid token; principal runtime key allowlist; `createLocalRepositories`; demo seed/reset/submission wave (seeded RNG).
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `data/scopes/{student-link.ts,principal.ts}`, `data/{repositories.ts,demo.ts,index.ts}`.

- [x] **T21: Preview services**
  - Description: OTP, Share (real wa.me), HandwritingReader, AutoTranslate, Payments, Sync per SPEC-services.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `services/{otp.ts,share.ts,reader.ts,translate.ts,payments.ts}` + `index.ts`.

- [x] **T22: React data bindings**
  - Description: `RepositoriesProvider`, `useScope`, `useLive(query)` (re-runs on storage events), `ServicesProvider`; app-level provider wiring.
  - Acceptance: a teacher tab updates when a student tab submits (two-provider test on a shared fake driver).
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `data/react/{provider.tsx,use-live.ts}`, `services/react.tsx`, `src/app/providers.tsx`.

- [x] **Checkpoint G (T20-T22)** full `npm run check`. *Slice 2 done.*
  - [x] All tests pass, build clean, size budget met
  - [x] Flow so far works end to end in en and hi


## Slice 3: Teacher onboarding + roster + Starter Checklist

- [x] **T23: Role chooser `/`**
  - Description: (3 cards, language visible, "Try with a demo class", link-paste help).
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `onboarding/screens/RoleChooser.tsx`, `src/app/page.tsx`.

- [x] **T24: Teacher onboarding steps 1-5**
  - Description: Progress state machine (skip/resume), OTP Preview, name/school, first class, roster (join link / paste ≤ 80 names / demo class), consent explainer.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `onboarding/lib/progress.ts`, `onboarding/screens/{TeacherStart,StepOtp,StepClass,StepRoster}.tsx`, `src/app/start/teacher/page.tsx`. *(Split into T24a steps 1-3 and T24b roster+consent if it exceeds ~5 files.)*

- [x] **T25: Desk shell + Starter Checklist**
  - Description: `/t` with empty state, checklist with 5 steps, stickers (inline SVG), celebrations; hides at 5/5.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `desk/screens/Desk.tsx`, `desk/components/{StarterChecklist,Sticker}.tsx`, `src/app/t/page.tsx`.

- [x] **Checkpoint H (T23-T25)** e2e: `/` → teacher → class → desk shows checklist with 1-2 done, en+hi.
  - [x] All tests pass, build clean, size budget met
  - [x] Flow so far works end to end in en and hi


## Slice 4: Create homework + share

- [ ] **T26: Create flow core**
  - Description: class/chapter, 5 suggested bank questions preselected, due default, publish; `?mission=1` prefill.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `homework/screens/Create.tsx`, `homework/components/{BankPicker,DuePicker}.tsx`, `homework/lib/suggest.ts`, `src/app/t/create/page.tsx`.

- [ ] **T27: Own-question editor**
  - Description: types MCQ/fill/short/photo, bilingual tabs, variants chips, concept tag, limits, Auto-translate (Preview).
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `homework/components/{QuestionEditor,OptionList,VariantChips,BilingualField}.tsx`.

- [ ] **T28: Share sheet + reuse/template**
  - Description: message templates en/hi, wa.me, copy, native share; reuse last; save/use template.
  - Acceptance: ≤ 4 taps Desk → shared (e2e).
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `homework/components/ShareSheet.tsx`, `homework/lib/{message.ts,reuse.ts}`.

- [ ] **Checkpoint I (T26-T28).**
  - [ ] All tests pass, build clean, size budget met
  - [ ] Flow so far works end to end in en and hi


## Slice 5: Student/parent link + consent + offline

- [ ] **T29: Link entry**
  - Description: fragment parse (zod), invalid-link screen, language picker, name pick + "Not me", consent line, warm-up.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `student-link/lib/fragment.ts`, `student-link/screens/{LinkEntry,PickName,Consent,WarmUp}.tsx`, `src/app/h/page.tsx`.

- [ ] **T30: Question player**
  - Description: one per screen, MCQ radios/fill/short inputs, autosave per change, progress dots, skip/back; the language switch keeps the answer.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `student-link/screens/Player.tsx`, `student-link/components/{McqInput,TextAnswer,ProgressDots}.tsx`.

- [ ] **T31: Submit + after**
  - Description: review list, submit, late tag, success stamp, edit until deadline, Today/Practice/My progress tabs (practice/progress filled in slice 7); teacher "Preview as student" (`#preview=`).
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `student-link/screens/{Review,Success,Tabs}.tsx`.

- [ ] **Checkpoint J (T29-T31)** e2e student path en+hi; reload restores answers; bundle ≤ 150 KB.
  - [ ] All tests pass, build clean, size budget met
  - [ ] Flow so far works end to end in en and hi

- [ ] **T32: `/join` self-join + pending names**
  - Description: (teacher approves in Class).
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `student-link/screens/Join.tsx`, `src/app/join/page.tsx`, `desk`-independent Class roster approve UI in `src/app/t/class/page.tsx` (minimal).

- [ ] **T33: PWA**
  - Description: `app/manifest.ts`, `public/sw.js`, registration component, sw headers; e2e offline reopen of `/h`.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: 4.


## Slice 6: Auto-check, review, insights, gap rules

- [ ] **T34: Results list + Concepts view (flagship)**
  - Description: Sticky headline, CONCEPTS card with highlighter, evidence, misconception, NEEDS HELP tags, practice CTA, Demo data label; "not enough answers yet" states.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `insights/screens/{ResultsList,Concepts}.tsx`, `insights/components/{ConceptRow,NeedsHelp}.tsx`, `src/app/t/results/page.tsx`.

- [ ] **T35: Review + override + paper marks grid**
  - Description: (keyboard arrows).
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `insights/screens/Review.tsx`, `insights/components/{ReviewItem,PaperGrid}.tsx`.

- [ ] **T36: Mission finale**
  - Description: onboarding publish → demo submission wave (animated tags; instant with reduced motion) → first insight → checklist step 4.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `onboarding/screens/MissionWave.tsx`, `onboarding/lib/mission.ts`.

- [ ] **Checkpoint K (T34-T36)** the flagship screen matches the look target (screenshot en+hi); the seed headline is computed.
  - [ ] All tests pass, build clean, size budget met
  - [ ] Flow so far works end to end in en and hi


## Slice 7: Practice, parent report, reminders, Evening Wrap

- [ ] **T37: Practice**
  - Description: draft sheet, swap/remove, approve + share; Practice tab on `/h`; re-check view; checklist step 5.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `insights/screens/{PracticeDraft,Recheck}.tsx`, `student-link/screens/PracticeTab.tsx`.

- [ ] **T38: Parent report**
  - Description: bands on `/h` My progress + teacher Class view.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `family/components/ReportCard.tsx`, `family/screens/ClassReport.tsx`, `student-link/screens/ProgressTab.tsx`.

- [ ] **T39: Reminders + daily summary + desk notes**
  - Description: remind composer, Reminder record, desk note ordering, Evening Wrap note.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `family/components/RemindComposer.tsx`, `desk/lib/notes.ts`, `desk/components/{Note,EveningWrap}.tsx`.

- [ ] **Checkpoint L (T37-T39)** the full teacher loop e2e in < 3 min scripted; en+hi.
  - [ ] All tests pass, build clean, size budget met
  - [ ] Flow so far works end to end in en and hi


## Slice 8: Guided photo capture (Preview reading)

- [ ] **T40: Camera screen**
  - Description: tap-to-start, lifecycle cleanup, frame sampling ≤ 5 fps, one live message, auto-capture, torch, lens tip; lazy-loaded.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `capture/screens/Capture.tsx`, `capture/hooks/{useCamera,useFrameAssessment}.ts`.

- [ ] **T41: After capture**
  - Description: score words + retake reason, re-encode (EXIF stripped, ≤ 1600 px), file-picker fallback with magic-byte check, BlobStore, photo question in the player, Review shows the reader (Preview) suggestion.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `capture/lib/{encode.ts,file-check.ts}`, `capture/components/PhotoResult.tsx`, `student-link/components/PhotoAnswer.tsx`.

- [ ] **Checkpoint M (T40-T41)** tested with a fake camera stream in Playwright (`--use-fake-device-for-media-stream`).
  - [ ] All tests pass, build clean, size budget met
  - [ ] Flow so far works end to end in en and hi


## Slice 9: Principal

- [x] **T42: Principal onboarding**
  - Description: (school code, explainer, lock explainer, invite composer).
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `onboarding/screens/{PrincipalStart,PrincipalExplainer}.tsx`, `src/app/start/principal/page.tsx`.

- [x] **T43: Overview + lock**
  - Description: headline, tiles, Indian formatting, lock state with count; lazy route.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `principal/screens/Overview.tsx`, `principal/components/{Tile,LockPanel}.tsx`, `src/app/p/page.tsx`.

- [x] **T44: Gaps heatmap (SVG, keyboard) + Classes + Plan (Preview trial/upgrade)**
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `principal/screens/{Gaps,Classes,Plan}.tsx`, `src/app/p/{gaps,classes,plan}/page.tsx`.

- [ ] **Checkpoint N (T42-T44).**
  - [ ] All tests pass, build clean, size budget met
  - [ ] Flow so far works end to end in en and hi


## Slice 10: Privacy, settings, demo mode

- [ ] **T45: `/privacy` "what we keep" + consent status + CSV export**
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `privacy/screens/{WhatWeKeep,ConsentStatus}.tsx`, `privacy/lib/export.ts`, `src/app/privacy/page.tsx`.

- [ ] **T46: Delete flows + settings**
  - Description: (text size, sound/haptics off by default, demo toggle).
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `privacy/screens/{DeleteData,Settings}.tsx`, `src/app/t/settings/page.tsx`.

- [ ] **T47: Demo mode + tours**
  - Description: badge, script overlay (lazy, `?` key), Reset demo, coach-mark tours per screen, Help replay.
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: `onboarding/screens/DemoOverlay.tsx`, `onboarding/lib/tours.ts`, `foundation`-level Help wiring.

- [ ] **Checkpoint O (T45-T47).**
  - [ ] All tests pass, build clean, size budget met
  - [ ] Flow so far works end to end in en and hi


## Slice 11: Polish

- [ ] **T48: Motion pass**
  - Description: (peel, swipe, tag drop; reduced-motion verified).
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: listed in plan.md

- [ ] **T49: Microcopy pass**
  - Description: en+hi (natural Hindi; list for native review).
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: listed in plan.md

- [ ] **T50: Accessibility pass**
  - Description: (keyboard, focus, labels, contrast, screen-reader names on icon buttons).
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: listed in plan.md

- [ ] **T51: Hindi layout pass**
  - Description: (e2e on every route × both languages at 390 px: no overflow, no clipped matras via line-height checks, screenshots).
  - Acceptance: behaviour above works; loading/empty/error states and en+hi covered by tests
  - Verify: `npm run check` + 390 px en/hi browser check
  - Files: listed in plan.md

- [ ] **Checkpoint P** ready for Phase 5.
  - [ ] All tests pass, build clean, size budget met
  - [ ] Flow so far works end to end in en and hi


## Closing phases

- [ ] Phase 5: verify the whole product (flows × 3 roles × 2 languages, review, security audit, perf → docs/perf.md, a11y)
- [ ] Phase 6: ship (README, CI, shipping checklist, **CHECKPOINT 4** before the production deploy, rollback note)

## NOTICED BUT NOT TOUCHING

_Issues seen outside the current task. Logged here, not fixed silently._

- **Look-target numbers vs gap rules (T18).** The mock-up's "Comparing fractions 41%" cannot coexist with "only 6 stuck" under the
  ≥2-attempts/<50% rule (minimum class rate with 6 of 32 stuck is ~41% only if every other child sits at exactly 50%). The seed is
  realistic instead: rules compute 6 stuck at a 59% class rate (Adding 88%, Equivalent 64%). Owner may want to know.
- **Demo tokens are deterministic (T18).** Seeded demo homework/join tokens come from a fixed seed (fine for public demo data);
  every real teacher-created class/homework uses Web Crypto. Re-check before any real deployment with real children.

