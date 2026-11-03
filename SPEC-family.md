# SPEC-family

Module id: `family` · Depends on: `foundation`, `data`, `services` · Routes: `/t/class?id=<classId>&v=report|remind`, `/h` (My progress)

## Objective
Parents understand where their child stands in plain words and their own language; teachers nudge pending parents without
spamming anyone.

## Parent report
- Per child, per concept: **Understood / Getting there / Not yet / Not enough answers yet** (domain `reportBand`), plus one
  plain line per "Not yet": "Practice is ready on the same link."
- Shown on `/h` → My progress (own child only) and in the teacher's Class view. School-branded header is a School-plan feature
  (shown as locked on Free).
- Language follows the device choice; content falls back with a note.

## Reminders
- "Remind pending parents" composer: counts pending children (no names in the message), builds a bilingual template for the
  class WhatsApp group, opens wa.me **only on the teacher's tap**. It records a `Reminder` (time, homework, count) and never sends anything.

## Daily summary
- One per day per teacher: a desk note generated after the first due time passes, summarising submissions, stuck count and
  the suggested action (feeds `desk`). No per-submission notices.

## Acceptance
- Unit: report bands at boundaries; reminder text contains no child names and URL-encodes correctly.
- Component: the report renders all four states in en and hi.
