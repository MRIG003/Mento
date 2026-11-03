# SPEC-privacy

Module id: `privacy` · Depends on: `foundation`, `data` · Routes: `/privacy` (public), `/t/settings`, `/t/class?id=…&v=privacy`

## Objective
DPDP-minded by design (design intent, not legal advice): consent per student, purpose limitation, export, deletion, and a
readable "what we keep and for how long".

## Features
- **What we keep (public `/privacy`):** a table in en/hi: what (first name, class, answers, photos, consent record, device
  preferences), where (this phone only in v1), why (to help the teacher teach), how long (until the teacher deletes it, or
  the end of the academic year + 90 days once a backend exists, *proposed, needs counsel*), who sees what (teacher: own
  classes; student link: own work; principal: totals only). Plus "No ads. No tracking. Nothing sent to other companies."
- **Consent status** per student in Class: granted (on link / by teacher), date, withdraw. Students without consent can still
  answer on paper; link submissions require the consent line first.
- **Export CSV** per class: first name, homework, question, verdict, submitted at, late. Formula-injection-safe
  (`domain.escapeCsvCell`). A Blob download is generated locally; the file name contains no names.
- **Delete:** a student (cascades answers, photos, consent), a class, or "Delete all my data on this phone". Typed
  confirmation ("DELETE" / "हटाएँ"), then irreversible.
- **Settings:** language, text size (100 / 115 / 130%), sound and haptics (off by default), demo mode toggle, Reset demo.

## Acceptance
- Unit: CSV escaping (`=1+1`, `+91…`, `-2`, `@x`, tab, quotes, newlines); export contains only that teacher's class.
- Component: delete requires the typed confirmation; after deleting, the data scopes return `NOT_FOUND`, and the photos are removed from `BlobStore`.
