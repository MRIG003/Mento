# Spec: Mento v1 (shared)

Status: **Draft for CHECKPOINT 2.** Module index: [CAPABILITY-MAP.md](CAPABILITY-MAP.md) (approved).
Module specs: `SPEC-<module-id>.md`. Threat model: [docs/threat-model.md](docs/threat-model.md).
ADRs: [docs/decisions/](docs/decisions/README.md). Product direction: [docs/creative-brief.md](docs/creative-brief.md) (approved).

---

## 0. Assumptions (correct me now or I proceed with these)

1. **Single device, no backend.** All data lives in the browser (localStorage + IndexedDB). Teacher, student link
   and principal views share one browser profile in the demo. Cross-phone sync is a labelled Preview (ADR-001).
2. **Fully static Next.js output** with client-side data. No server routes, no Server Actions, no cookies. Pages are
   prerendered shells. This keeps hosting free and fast and makes a strict CSP possible (ADR-008).
3. **Link tokens travel in the URL fragment** (`/h#k=<token>&lang=hi`), so they never reach Vercel logs or
   `Referer` headers. Internal ids (homework, class) use query strings on teacher-only routes (ADR-009).
4. **"Active teacher" this week** = published at least one homework in the last 7 days **and** opened its
   Results after at least one submission was checked. Logging in does not count.
5. **Parent-report bands** (an extension of the gap rules, ADR-004): *not yet* = stuck (≥2 attempts, <50%);
   *getting there* = ≥2 attempts, 50% to <80%; *understood* = ≥2 attempts, ≥80%; otherwise "not enough answers yet".
6. **Practice "at their level"** = bank questions on the same concept at difficulty 1-2 (of 3) that the student has
   not seen in the source homework; 3-5 questions; the teacher approves before it goes out.
7. **Number answers** are equal when both parse to the same number after normalisation (`0.5` = `.5` = `०.५`).
   Fractions are compared as typed (`3/4` ≠ `6/8`) unless the teacher lists the variant, since equivalence can be
   the very thing being tested.
8. **Hindi loose matching** for short words: also folds chandrabindu → anusvara (ँ → ं) and drops nukta (ज़ → ज).
   Teacher-listed variants always apply.
9. **Demo clock.** The demo uses the real clock, but seed data is generated relative to "now", so due dates and
   "this week" always look current.
10. **Versions** are pinned exactly, choosing the newest release that is at least 14 days old (ADR-012).
11. **No sound assets** ship in v1 beyond one tiny tick (≤3 KB) for the optional sound setting.
12. Content uses **plain text plus a simple fraction notation** (`3/4` is rendered as a stacked fraction by our own
    component). No HTML or Markdown authoring.

---

## 1. Objective

Teachers in affordable private schools in India (Classes 3-8) turn each homework into a diagnosis: who is
stuck, on which concept, and what to do next. Core loop: **Create → Check → See who is stuck → Act**, in English
and Hindi with a one-tap switch on every screen.

Users: Teacher (primary, phone only), Principal/owner (buyer, aggregates only), Parent (influencer, often Hindi),
Student (end user on a shared phone).

User stories (each traced to a module spec):
- As a returning teacher I create and share a homework in under 30 s (first time under 3 min). → `homework`
- As a student I open a WhatsApp link, pick my name, answer and submit with no account or install. → `student-link`
- As a teacher I see "6 students stuck on Comparing fractions" with the evidence, and can override any mark. → `insights`
- As a teacher I give those 6 practice at their level with one tap after approving it, and later see if it helped. → `insights`
- As a parent I read a plain-language report in my language. → `family`
- As a principal I see school-wide gaps as aggregates and understand in under a minute why part is locked. → `principal`
- As anyone I switch EN ⇄ हिं in one tap without losing anything. → `foundation`
- As a first-time user of any role I reach the "aha" moment through a guided, skippable path. → `onboarding`, `desk`

## 2. Tech Stack (pinned, ADR-012)

| Package | Version | Why |
|---|---|---|
| next | 16.4.2 | App Router, static prerender, headers config, manifest (decided stack) |
| react, react-dom | 19.3.1 | Required by Next 16 |
| zod | 4.6.7 | Boundary validation; `zod/mini` on client routes to save bytes (ADR-010) |
| typescript | 6.0.3 | Strict, `noUncheckedIndexedAccess`. Not 7.x: typescript-eslint peer is `<6.1` (ADR-007) |
| tailwindcss, @tailwindcss/postcss | 4.3.3 | Decided stack; CSS-first `@theme` tokens |
| eslint, eslint-config-next | 10.13.0, 16.4.2 | `next lint` was removed in v16; ESLint CLI. Includes jsx-a11y |
| vitest, @vitejs/plugin-react, jsdom | 5.0.5, 6.1.2, 30.1.3 | Unit + component tests (Next docs: guides/testing/vitest) |
| @testing-library/react, /jest-dom, /user-event | 16.3.3, 7.0.1, 14.6.8 | Component tests that check state, not internals |
| fake-indexeddb | 6.2.6 | Real-behaviour IndexedDB fake for photo-store tests (a fake, not a mock) |
| @playwright/test | 1.63.0 | Matches the preinstalled Chromium; smoke tests at 390 px |
| @types/react, @types/react-dom, @types/node | 19.3.0, 19.3.0, 26.6.5 | Types |
| @fontsource/nunito, /caveat, /noto-sans-devanagari | 5.3.0 | Source of self-hosted woff2 files (copied into `src/fonts`, loaded by `next/font/local`) |

Nothing else without asking. Lighthouse runs via `npx` in Phase 5 and is not a dependency. The bundle check is our own
script (no size-limit dependency).

## 3. Commands

Planned in slice 1 and recorded in `package.json`. **Unverified until slice 1 runs them.** Once verified, CLAUDE.md
and this section are updated with any changes.

```
npm ci                      # install from lockfile
npm run dev                 # next dev (Turbopack default in v16)
npm run build               # next build
npm run start               # next start (serve the production build)
npm run lint                # eslint .
npm run typecheck           # tsc --noEmit
npm test                    # vitest run
npm run test:watch          # vitest
npm run e2e                 # playwright test (390 px, en + hi)
npm run size                # node scripts/check-bundle.mjs (fails over budget)
npm run check               # lint && typecheck && test && build && size  (CI runs this)
```

## 4. Project Structure

```
src/
  app/                       Next App Router routes only (thin; compose module screens)
    page.tsx                 role chooser
    t/ …                     teacher: desk, create, results, class, settings
    p/ …                     principal: overview, gaps, classes, plan (lazy)
    h/ …                     student/parent link (fragment token)
    join/                    roster self-join (fragment token)
    start/ …                 onboarding paths
    privacy/                 "what we keep and for how long"
    manifest.ts              PWA manifest
  modules/<module-id>/       one folder per capability-map module
    index.ts                 public API (the only import target from outside)
    components/  hooks/  lib/  screens/
    *.test.ts(x)             co-located unit/component tests
  fonts/                     self-hosted woff2 subsets (Latin, Devanagari)
  i18n/en.ts  i18n/hi.ts     string catalogues (hi typed against en keys)
public/sw.js                 hand-written service worker (ADR-006)
e2e/                         Playwright smoke tests
scripts/check-bundle.mjs     bundle budget check
docs/  decisions/  threat-model.md  perf.md  screens/
tasks/plan.md  tasks/todo.md
```

Import rule: `@/modules/<id>` resolves only to that module's `index.ts`. ESLint `no-restricted-imports` blocks
deep imports and feature→feature imports (CAPABILITY-MAP dependency rules).

## 5. Code Style

TypeScript strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. Prefer `type` aliases, string-literal
unions over enums, discriminated unions for variants, branded ids, no `any`, no non-null `!` and no `as` casts outside
tested parsers. Named exports. Small pure functions in `lib/`; components render only. Expected failures return
`Result` and are never thrown. Every user-visible string goes through `t()`.

```ts
// src/modules/domain/lib/gap-rules.ts
import type { ConceptEvidence, StudentConceptStatus } from './types';

/** Student rule (SPEC-domain §Gap rules): flag only with ≥2 attempts and fewer than half right. */
export const MIN_STUDENT_ATTEMPTS = 2;

export function studentConceptStatus(evidence: ConceptEvidence): StudentConceptStatus {
  const { attempted, correct } = evidence;
  if (attempted < MIN_STUDENT_ATTEMPTS) return { kind: 'not-enough-evidence', attempted, correct };
  // Integer comparison avoids float edge cases: correct/attempted < 1/2  ⇔  2·correct < attempted
  if (2 * correct < attempted) return { kind: 'stuck', attempted, correct };
  return { kind: 'on-track', attempted, correct };
}
```

```ts
// src/modules/domain/lib/gap-rules.test.ts
describe('studentConceptStatus', () => {
  it('needs at least 2 attempts before judging', () => {
    expect(studentConceptStatus({ attempted: 1, correct: 0 }).kind).toBe('not-enough-evidence');
  });
  it('flags 1 of 3 right (33%) as stuck', () => {
    expect(studentConceptStatus({ attempted: 3, correct: 1 }).kind).toBe('stuck');
  });
  it('does not flag exactly half right (2 of 4)', () => {
    expect(studentConceptStatus({ attempted: 4, correct: 2 }).kind).toBe('on-track');
  });
});
```

Naming: files `kebab-case.ts`, components `PascalCase.tsx`, hooks `useThing.ts`, tests `*.test.ts(x)`.
CSS: Tailwind utilities with semantic tokens (`bg-paper`, `text-ink`, `bg-note`), no arbitrary hex values in components.
Comments explain *why*; cite the doc URL where a pattern is not obvious (source-driven).

## 6. Testing Strategy

- **Unit (Vitest, node env):** every rule in `domain`, `data` migrations and scopes, `services` mocks, capture
  heuristics. TDD: red → green → refactor. Prove-It: every bug fix starts with a failing test.
- **Component (Vitest + jsdom + Testing Library):** every screen's loading / empty / error / success states; language
  switch keeps input; keyboard reachability of primary actions. Check visible state, not calls.
- **E2E smoke (Playwright, Chromium, 390×844):** (1) teacher first-run → insight → practice, (2) student link →
  submit, (3) principal → locked/unlocked explainer, (4) language switch on each main screen keeps typed answer,
  (5) no horizontal overflow on every route, in **en and hi**. Screenshots in `docs/screens/` at Phase 5.
- **Fakes over mocks:** an in-memory `StorageDriver`, `fake-indexeddb`, deterministic `Clock` and `RandomSource`.
- **Coverage expectation:** `domain` ≥ 95% lines (it holds every rule); others are covered by states, not percentages.
- **Required tests (non-negotiable):** auto-check per question type; accepted variants; Devanagari normalisation
  (NFC, zero-width, digits, spacing); gap rules at boundaries (1 vs 2 attempts, 49% vs 50%, 59% vs 60%, 2 vs 3
  attempts); photo-quality scoring on synthetic dark/blurred/glared/sharp ImageData; i18n key parity; CSV
  formula-injection escaping; token uniqueness and length; storage migration from an older schema; late tagging.

## 7. Boundaries (whole project, mirrored in CLAUDE.md)

- **Always:** validate inputs at boundaries (storage reads, URL fragment/query, file input, camera frames, form
  fields); escape on output (React text only); test logic before shipping; keep demo data labelled "Demo data";
  put every string in en + hi; keep the build green between slices.
- **Ask first:** new dependencies; any network call other than the app's own origin; storage schema changes beyond
  the planned migration chain; anything that stores personal data off-device; CI changes beyond the minimal workflow.
- **Never:** commit secrets; add analytics, trackers, error-tracking vendors or third-party scripts; send children's
  data anywhere; auto-send messages; remove or skip a failing test to get green; use `dangerouslySetInnerHTML`,
  `innerHTML` or `eval`; put names or personal data in URLs.

## 8. Performance Budgets (performance-optimization)

Target device: low-end Android, slow 4G, 4× CPU throttle. Measured with Lighthouse / DevTools traces; numbers in
`docs/perf.md`; `npm run size` guards JS budgets in CI.

| Route | First-load JS (gzip) | LCP | CLS | INP |
|---|---|---|---|---|
| `/h` student/parent link | **≤ 150 KB** | < 2.5 s | < 0.1 | < 200 ms |
| `/` role chooser | ≤ 150 KB | < 2.5 s | < 0.1 | < 200 ms |
| `/t` teacher desk | ≤ 200 KB | < 2.5 s | < 0.1 | < 200 ms |
| `/p` principal (lazy) | ≤ 220 KB | < 3.0 s | < 0.1 | < 200 ms |

- Fonts: Latin + Devanagari subsets only, `font-display: swap`, preload only the UI weight in use. Caveat is loaded only where
  English accents are shown.
- Lazy-loaded: camera/capture, principal dashboard, onboarding tours, demo overlay.
- No heavy libraries (no moment, lodash, chart libs, UI kits). Charts are CSS/SVG.
- Photos compressed to ≤ 1600 px long edge, JPEG q≈0.7, target ≤ 300 KB, before storage.
- A reason is written down before any budget is changed.

## 9. Interface contracts (contract-first)

The authoritative contracts live in the provider module specs:
- Entities, rules and the error model: [SPEC-domain.md](SPEC-domain.md)
- Storage driver, repositories, role scopes, migrations, seed: [SPEC-data.md](SPEC-data.md)
- Simulated services (OTP, Share, HandwritingReader, AutoTranslate, Payments, Sync): [SPEC-services.md](SPEC-services.md)

Error semantics everywhere: expected failures are `Result<T, AppError>` with
`AppError = { code: 'NOT_FOUND' | 'VALIDATION' | 'FORBIDDEN' | 'CONFLICT' | 'STORAGE' | 'UNAVAILABLE'; messageKey: I18nKey; details?: unknown }`.
UI shows `t(messageKey)`. Programming errors throw and are caught by route `error.tsx` boundaries with a bilingual message.

## 10. Success Criteria (testable)

1. Demo: a first-time teacher goes from `/` to first insight and first practice in < 3 min (timed e2e script with scripted input).
2. Returning teacher "reuse last homework → share" in ≤ 4 taps and < 30 s.
3. A principal sees a lock explainer naming the rule and current count on first view.
4. A student completes `/h` → submit with no account; answers survive reload and offline.
5. The language switch is ≥ 44 px, on every route for every role, re-renders without navigation and keeps scroll and input (e2e).
6. The i18n parity test passes; no hardcoded UI string (lint rule on JSX text literals).
7. Every number on screen comes from seed data via `domain` rules; "Demo data" badge visible in demo mode.
8. Preview features carry a visible "Preview" label (component test per feature).
9. `npm run check` passes; budgets met or the gap documented in `docs/perf.md`.
10. Threat model reviewed in Phase 5; security headers verified on the deployed URL.
11. WCAG 2.1 AA: keyboard reachability, visible focus, labels, 4.5:1 text contrast, reduced motion respected.

## 11. Open Questions

1. **Demo submission timing.** The wave arrives over ~5 s (animated name tags), or instantly? *(Default: ~5 s, instant under reduced motion.)*
2. **Text size setting:** three steps (100% / 115% / 130%)? *(Default: yes.)*
3. **Service worker in v1:** cache the app shell for offline reopen of `/h`? *(Default: yes, minimal, ADR-006.)*
