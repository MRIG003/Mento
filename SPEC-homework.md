# SPEC-homework

Module id: `homework` · Depends on: `foundation`, `data`, `services` · Routes: `/t/create`, `/t/create?from=<hwId>`, `/t/create?mission=1`

## Objective
A returning teacher creates and shares a homework in < 30 s; a first-timer in < 3 min.

## Flow
1. **Class + chapter** (last used preselected). 2. **Questions:** the bank for that chapter shows 5 suggested questions
already ticked (spread across the chapter's concepts, difficulty 1-2); the teacher can untick or add more, or **Write my own**
(type picker: MCQ, Number/fill-in, Short answer, Notebook photo [Preview reading]). 3. **Due** (defaults to the last due time,
first time tomorrow 20:00). 4. **Preview as student** (renders the `student-link` route in preview mode via
`/h#preview=<hwId>`, with nothing saved). 5. **Publish → Share sheet:** link, Copy, **Share on WhatsApp** (message template in
the homework's language), native share when available.

Shortcuts: **Reuse last homework** (copies questions, moves to the next unseen bank questions of the same chapter
where possible), **Save as template**, **Use template**. Paper fallback is entered later from Results (`insights`).

## Own-question editor
- Fields per language (EN / हिं tabs inside the editor); a question needs a prompt and a key in at least one language.
- "Add other language" shows the empty side; **Auto-translate (Preview)** fills a machine draft marked "check this", or shows
  "Preview: type it yourself" when the mock has no glossary match.
- MCQ: 2-5 options, exactly one correct, optional "what this wrong answer means" per option.
- Fill: answer + accepted variants (chips) + "this is a number" toggle.
- Short: 1-4 key points + variants + "needs at least N points".
- Concept tag: required, picked from the chapter's concepts (or "new concept" with a bilingual name).
- Limits: prompt ≤ 300 chars, option ≤ 80, variants ≤ 10 × 40 chars. Plain text only.

## Acceptance
- Component tests: suggested set preselected; publish disabled until valid, with the reason shown; validation errors are
  bilingual and linked to fields.
- Unit: message template builder (en/hi) contains the class, chapter, due and link, and nothing else (no student data).
- E2E: reuse last → publish → share URL starts with `https://wa.me/?text=` and decodes to the template.
- The returning-teacher path is ≤ 4 taps from Desk (asserted by e2e step count).
