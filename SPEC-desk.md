# SPEC-desk

Module id: `desk` · Depends on: `foundation`, `data` · Route: `/t`

## Objective
The teacher's evening home: a few sticky notes saying what to do next, the Evening Wrap, and the Starter Checklist until it's done.

## Notes (computed from data, max 5 visible, most urgent first)
Priority order: Evening Wrap → stuck group with practice not yet sent → review items waiting → pending parents after due → homework in
progress (x of y) → re-check ready. Each note = one sentence + one action button, a pastel colour per kind, and a deterministic small rotation.
Tapping "Done" or completing the action moves it to the "Done today" tray (collapsed). Empty: "Desk is clear. Start with a homework."

## Evening Wrap
From `domain.buildEveningWrap`: after a homework's due time (or once ≥ 75% have submitted), show "Tomorrow, start with
{concept}. {n} children need it." with **Send practice** / **Not now**. "All clear" and "waiting" variants exist.

## Starter Checklist
1 Create a class · 2 Share the join link · 3 Publish your first homework · 4 See your first insight · 5 Send your first practice.
Each completed step shows a stationery sticker (paperclip, postage stamp, rubber stamp, highlighter cap, gold star seal) and a
one-line celebration. The checklist is hidden when all five are done (it can be reopened from Help).

## Acceptance
- Unit: note ordering from fixtures; Evening Wrap variants.
- Component: empty, loading (paper skeleton), error (bilingual retry) and populated states; the checklist hides at 5/5.
