# SPEC-insights

Module id: `insights` · Depends on: `foundation`, `data` · Routes: `/t/results`, `/t/results?hw=<id>&v=review|concepts`, `/t/practice?draft=<id>`

## Objective
Turn checked answers into "who is stuck, on what, and what to do", with evidence, while leaving the teacher in charge.

## Results tab
- **List** of homework (newest first): submitted x of y, items needing review, status words.
- **Concepts view (flagship)** – the look target:
  - Sticky note (yellow, −1.5°, pink washi) with the computed headline in Caveat (en) / Noto Sans Devanagari (hi):
    "6 students stuck on Comparing fractions", and below it "Class 6B Maths · 32 of 40 submitted".
  - CONCEPTS card: one row per concept with label, % right, thin bar (ok/warn/bad colour **plus** a status word). The weakest
    *class-gap* concept sits on a `HighlighterMark` swipe. Concepts with "not enough answers yet" show that phrase instead of a %.
  - Evidence under the highlighted row: "Got 1 of 4 right" style counts, the most-missed question, and a likely misconception
    (only when ≥ 2 children chose that distractor).
  - NEEDS HELP: pastel `NameTag`s for the students `stuck` on the highlighted concept (deterministic colour/rotation per id).
  - Primary pill: "✏ Give practice to these 6", with the "Demo data" label beneath in demo mode.
- **Review view:** only items with `unsure` (short answers, photos, reader suggestions) plus anything the teacher opens.
  Each item shows the answer, the key, the reason, and actions **Mark correct / Mark incorrect**; overrides record `overriddenFrom`.
  "Accept all suggestions" applies only to reader-preview suggestions and is labelled Preview.
- **Paper marks:** a grid of students × questions with ✓/✗ toggles (44 px cells, keyboard arrows), for children without phones.

## Practice
`draftPractice` → a review sheet listing 3-5 questions, the students, and the language. The teacher can remove or swap
questions, then **Approve and share** (share sheet with a practice message). Practice appears on the same `/h` link
under Practice for those students only. **Re-check**: when ≥ 1 targeted student has submitted practice, Results shows
"Comparing fractions for these 6: 1 of 4 → 3 of 4 right" (domain `recheckDelta`), plus "not enough answers yet" per student where it applies.

## Acceptance
- Seeded 6B Fractions renders "6 students stuck on Comparing fractions" computed by rules (component test with real
  repositories over an in-memory driver).
- Overriding one evaluation updates the concept % and flags immediately (test).
- No concept shows a % or flag below the evidence thresholds (test at the boundaries).
- Status never relies on colour alone (each bar has a status word; axe-style check in e2e).
