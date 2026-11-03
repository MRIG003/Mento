# SPEC-onboarding

Module id: `onboarding` · Depends on: `foundation`, `data`, `services` · Routes: `/`, `/start/teacher`, `/start/principal`; demo overlay everywhere (lazy)

## Objective
Every first-time role reaches its "aha" fast: the teacher sees a first insight and sends a first practice in < 3 min in the demo,
the principal understands the dashboard and lock in < 1 min, and the student goes from link to submit with no account. Never a blocking wall. (ADR-005)

## Role chooser (`/`)
Three big cards: "I'm a teacher", "I'm a principal", "I got a link from my child's school" (the last explains: "Open the link from
WhatsApp again" plus a paste-link field). The language switch is visible. "Try with a demo class" shortcut.

## Teacher path (progress indicator "Step 2 of 7", Skip and Resume)
1. Phone + OTP (**Preview**; the code is shown on screen). 2. Name and school. 3. First class (grade 3-8, section, subject, default
language). 4. Roster: share the join link **or** paste names **or** use the demo class. 5. Consent setup (explains the consent line parents
will see). 6. **First-homework mission:** opens `/t/create?mission=1` with a prefilled sample chapter and coach marks. 7. Preview as student
→ publish and share → **demo submission wave** (labelled) → first insight → first practice. Each step updates `OnboardingProgress`.

## Principal path
School code (from a teacher; demo code shown) or invite link → explainer "What Mento shows you (and what it never shows)" → demo
school dashboard → lock explainer (the 3+ active teachers rule) → invite teachers (WhatsApp composer).

## Student/parent path
Lives in `student-link` (language → name → consent → warm-up → homework → success); onboarding only provides the coach-mark content.

## Tours and help
Coach marks: max 4 per screen, one sentence each, skippable; "Help" in the top bar replays the current screen's tour. Content
lives in i18n catalogues; seen-state is in `OnboardingProgress`.

## Demo mode
On by default for first open. "Demo data" badge in the top bar; script overlay (presenter steps, collapsible, keyboard
shortcut `?`); **Reset demo** (re-seeds, keeps the language). The overlay code is lazy-loaded.

## Acceptance
- Unit: progress state machine (skip, resume, complete; resume lands on the first unfinished step).
- E2E: timed teacher demo run from `/` to "practice approved" completes; the principal path shows the lock count.
- Every step works with the keyboard alone and announces its step number to screen readers.
