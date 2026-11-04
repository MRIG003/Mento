# Mento

Homework that tells a teacher **who is stuck, on which concept, and what to do next**.
A mobile-first web app for teachers in affordable private schools in India (Classes 3-8). English and Hindi, one tap apart on every screen.

**Live demo:** https://mento-psi.vercel.app (Vercel; deploys from the `claude/friendly-bell-d1p91z` branch)
**Everything shown is demo data.** Open the app, tap **Try with a demo class**, and follow the script below.

> Design intent, not legal advice. The privacy design needs review by counsel before real children's data is used.
> Hindi text is flagged for native-speaker review. "Mento" needs a trademark check before public launch.

## Core loop

Create → Check → See who is stuck → Act.

1. A teacher creates homework in under a minute (suggested questions, due time, one link, a ready WhatsApp message).
2. Children open the link on a parent's phone: no account, no install. They pick their name, answer, submit.
3. Mento auto-checks and shows "6 students stuck on Comparing fractions" with the evidence and the likely mix-up.
4. One tap drafts practice for those children. The teacher approves it, and it appears on the same link.

## Demo script (about 3 minutes)

1. **Try with a demo class** → the Desk with the Starter Checklist.
2. **Results** → the sticky-note headline, computed from the demo answers by the real gap rules; highlighter on the weak concept.
3. **Give practice to these 6** → check the questions → **Approve and share**.
4. Open the link it shows → pick **Anaya** → **Practice** → answer and submit.
5. Switch **EN | हिं** at any point; nothing typed is lost.
6. **Create** → add your own question, including a **Notebook photo** question → publish → open as a child → photograph a page → teacher **Review** shows it.
7. Role chooser → **I'm a principal** → code `DEMO26` → totals only, locked until 3 teachers are active.
8. **Class** tab → consent, CSV download, delete, text size. `/privacy` → what we keep.
9. **Reset demo** (Desk, or the **Demo guide** button / `?` key) starts again and keeps you signed in.

Screenshots (390 px, English and Hindi) are in [`docs/screens/`](docs/screens/).

## What is real and what is Preview

| Area | Status |
|---|---|
| Homework creation, bank, own questions (MCQ, number/fill-in, short answer, photo), due, reuse | **Real** |
| `wa.me` share link with a ready message in the homework language (you tap Send; nothing is auto-sent) | **Real** |
| Student link: name pick, consent line, one question per screen, drafts saved on the phone, late tagging, edit until the deadline | **Real** |
| Auto-check, Devanagari-aware matching, evidence-based gap rules, misconceptions, teacher override, practice, re-check | **Real** |
| Principal dashboard (aggregates only), lock rule at 3 active teachers | **Real** |
| Consent records, CSV export, delete, "what we keep", text size | **Real** |
| Guided photo capture: live on-device guidance, auto-capture, EXIF-free compression | **Real** |
| Reading the handwriting in a photo | **Preview** (simulated; the teacher always decides) |
| Phone OTP sign-in | **Preview** (code shown on screen; no SMS; the phone number is not stored) |
| Auto-translate between English and Hindi | **Preview** (tiny glossary; refuses unknown text; always editable) |
| Trial, quote, payments | **Preview** (nothing is charged) |
| Syncing between phones, accounts, a server | **Not built.** Data lives in the browser that opened it. |

Single-device limit: a child's answers reach the teacher only if both use the same browser (as in the demo). The data layer sits behind
repository interfaces so a backend (for example Supabase) can replace it without UI changes.

## Languages

All UI text, errors, onboarding, the parent report, consent and privacy text exist in English and Hindi. A test fails if any key is missing
in either language or a placeholder differs. Content (questions, options, concepts) has English and Hindi fields with graceful fallback.
**All Hindi needs native-speaker review.** It is written as simple everyday Hindi, not formal Hindi.

## Run it

Node 22.

```bash
npm ci
npm run dev          # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run lint` | ESLint (Next + a11y rules; bans HTML injection, enforces module boundaries and no hardcoded UI strings) |
| `npm run typecheck` | `tsc` (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| `npm test` | Vitest: unit (Node) and component (jsdom) |
| `npm run build` | Production build |
| `npm run size` | First-load JS budget per route (fails over budget) |
| `npm run check` | All of the above |
| `npm run e2e` | Playwright at 390 px in English and Hindi (run `npm run build` first) |

To add a package, use `npx npm@11.21.1 install -E <pkg>@<version>` (npm 10 crashes on Vitest's peers; see ADR-012).

## Architecture

Next.js 16 App Router, static prerender, all data in the browser. Thirteen modules with one-way dependencies
(`foundation`, `domain` → `data`, `services` → feature modules); feature modules never import each other.

```
src/app/                routes only (thin)
src/modules/foundation  Stationery Desk tokens, i18n, shell, UI primitives
src/modules/domain      pure rules: schemas, answer checking, gap rules, aggregates, CSV (no I/O)
src/modules/data        storage (versioned, migrated, validated), role-scoped repositories, seed
src/modules/services    OTP, share, handwriting reader, translate, payments (contracts + Preview mocks)
src/modules/{homework, student-link, insights, capture, principal, privacy, onboarding, desk}
```

Role boundaries are enforced in the data layer: a teacher sees their own classes, a link holder sees one homework and the class's first
names, a principal gets aggregates only (a test fails if any child or teacher identifier appears).

Specs and plans: [CAPABILITY-MAP.md](CAPABILITY-MAP.md), [SPEC.md](SPEC.md) and `SPEC-<module>.md`, [tasks/plan.md](tasks/plan.md),
[tasks/todo.md](tasks/todo.md), [docs/threat-model.md](docs/threat-model.md), [docs/creative-brief.md](docs/creative-brief.md).

### Decisions (ADRs in [`docs/decisions/`](docs/decisions/README.md))

001 local-first storage behind role-scoped repositories · 002 own typed i18n, no locale routes · 003 on-device photo heuristics ·
004 evidence-based gap rules · 005 resumable onboarding · 006 minimal service worker (planned, see limits) · 007 TypeScript 6 ·
008 CSP (`script-src 'self' 'unsafe-inline'`; SRI tried and blocks hydration) · 009 link tokens in the URL fragment ·
010 zod 4 · 011 module isolation · 012 exact pins, releases at least 14 days old.

## Assumptions

- Gap rules: a child is flagged on a concept only with at least 2 attempts and under 50% right; a class concept with at least 3 attempts and under 60%.
  One wrong answer never proves a gap. "Not enough answers yet" is a first-class state.
- "Active teacher" = sent a homework and opened its results this week. Logging in alone does not count.
- Price shown as ₹200-400 per student per year is an **assumption to validate**.
- Demo numbers are generated from seed answers by the real rules. The mock-up's "41%" cannot coexist with "only 6 stuck" under these rules, so
  the demo shows 59% with 6 stuck.

## Privacy and security design

- No analytics, trackers, ads or third-party scripts. The only outside request is the user tapping a `wa.me` link. Four production
  dependencies (`next`, `react`, `react-dom`, `zod`); `npm audit` shows 0 production vulnerabilities.
- Link tokens are 128-bit (Web Crypto) and live in the URL fragment, so they never reach server logs. No names in any URL.
- Teacher content is always rendered as text; HTML injection patterns are banned by lint. CSV cells starting with `= + - @` are neutralised.
- Photos stay on the device, are re-encoded (EXIF/GPS dropped), size- and type-checked by real bytes, and the camera stops on leave.
- Security headers: CSP, `nosniff`, `Referrer-Policy: no-referrer`, camera-only Permissions-Policy, frame denial, HSTS, COOP.
- Consent is recorded per child; export and delete are in the Class tab; `/privacy` explains what is kept and for how long.

## Performance

Measured, not assumed; details and what was tried in [docs/perf.md](docs/perf.md).

- Real-throttled browser (4× CPU, 1.6 Mbps, 150 ms): LCP ≈ 0.3-0.6 s, CLS 0.
- **Lighthouse mobile (562 ms per request) shows LCP 2.9-3.9 s, above the 2.5 s target.** Not fixed yet; next levers are listed in perf.md.
- Accessibility: Lighthouse 100; a sweep of all 15 routes in both languages found no overflow, unnamed controls or targets under 44 px.

## Known limits (what was not verified or not built)

- Not tested on real phones, in the WhatsApp in-app browser, or on a real low-end device. Camera thresholds were tuned on synthetic images;
  torch support is unverified.
- No service worker yet, so reopening a link with no network does not work (answers are still saved on the phone while offline in the page).
- Not built: per-screen coach marks and the Help replay, motion polish, sound/haptics, a parent-report page for teachers, the reminder
  composer, multi-device sync, more than two languages. (The Evening Wrap note and a presenter's demo guide on the Desk are built.)
- The live deployment was checked only through the build logs, not browsed from the build environment.
- `npm audit` reports 16 moderate findings in dev-only linting packages (one minimatch advisory); not shipped.

## Deploy and roll back

Vercel project `mento` (team `mrig-003`), connected to this repo; pushes to the branch build and deploy automatically
(Node 22.x, `npm ci`, `npm run build`, Vercel Auth off so the demo link is public).

To roll back: in the Vercel dashboard open **Deployments**, pick the last good one and choose **Promote to Production**
(or **Instant Rollback**). Each deployment is immutable, so rolling back does not touch the data in anyone's browser.

## Licence and credits

Fonts (Nunito, Caveat, Noto Sans Devanagari) are self-hosted under the SIL Open Font License (licences in `src/fonts/`).
Engineering skills in `.claude/skills/` come from addyosmani/agent-skills (MIT).
Mento is inspired only by the principles of a classmate project called Kaksha; it uses its own visual language ("Stationery Desk") and copy.
