# SPEC-principal

Module id: `principal` · Depends on: `foundation`, `data`, `services` · Routes: `/p`, `/p/gaps`, `/p/classes`, `/p/plan` (lazy-loaded)

## Objective
In under a minute, a principal understands school-wide progress and why part of the dashboard is locked. Aggregates only, never
teacher rankings, never student names.

## Screens (all data via `PrincipalScope`)
- **Overview:** a plain-sentence headline ("Class 6 Maths is the biggest gap this term"); tiles for teachers active this week (with
  the definition inline), homework set, submission rate, practice sent and completed, parents who opened reports. Indian number format.
- **Gaps:** class × subject heatmap drawn as an SVG grid with highlighter intensity **plus** a % and a status word per cell; cells with
  < 3 attempts show "not enough answers yet".
- **Classes:** "Classes needing attention", each with its weakest concept. No teacher names next to numbers.
- **Plan:** Free (teacher) vs School plan comparison; "₹200-400 per student per year (pricing assumption, to validate)"; the
  unlock rule; **Start 30-day trial (Preview)** and **Request upgrade (Preview)** with the payments mock.
- **Lock:** when locked, Gaps and Classes show a blurred, labelled *demo preview* with "Unlocks when 3 teachers are active this
  week (now N)" or on upgrade. Overview stays visible.

## Acceptance
- `PrincipalScope` output has no student/teacher identifiers (type test + runtime key allowlist test).
- The lock state switches at exactly 3 active teachers (unit) and the explainer names the current count (component).
- The heatmap is keyboard-navigable, and each cell has an accessible label ("Class 6, Maths, 58% right, getting there").
