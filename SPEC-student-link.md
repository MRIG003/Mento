# SPEC-student-link

Module id: `student-link` · Depends on: `foundation`, `data` · Routes: `/h#k=<token>[&lang=hi]`, `/join#k=<classJoinToken>`

## Objective
Easier than WhatsApp + paper: open a link, pick your name, answer, done. No account, no install, weak network OK.

## Flow (`/h`)
1. **Parse the fragment** (zod: `k` = 22-char base64url, `lang` ∈ en|hi, unknown keys ignored). Invalid or unknown → a
   friendly "This link doesn't work. Ask your teacher for a new one." (no detail about why).
2. **Language:** fragment `lang` → device pref → browser. If none can be guessed, show two big buttons **हिन्दी** and
   **English** (each in its own script and font).
3. **Pick your name** from the class's first names (big pastel tags, search box when > 20). Then "You are Anaya? · Not me".
   The choice is remembered per token on this device; "Switch child" is in the menu for siblings on a shared phone.
4. **Consent line** (once per student per device): one sentence plus "Okay" and a link to "What we keep".
5. **Warm-up** (first ever visit): a ten-second practice question that explains the screen. It isn't stored as an answer.
6. **One question per screen:** progress dots, large targets (≥ 56 px options), Next/Back, Skip. **Every change saves to the
   phone immediately** ("Saved on this phone"). Fill inputs use `inputmode="decimal"` when numeric. MCQ options are radio
   buttons in a fieldset.
7. **Review and submit:** lists unanswered questions; submit is allowed with blanks. Late is tagged by the rule and shown kindly.
8. **Success stamp.** Editable until the deadline ("Change answers"). After the deadline: read-only.
Tabs: **Today** (current homework), **Practice** (practice sets targeted at this child), **My progress** (own report bands).

## `/join`
Class join link for roster building: pick your name if the teacher added it, or "My name isn't here" → type the first
name (≤ 30 chars, letters only, any script), added as pending for teacher approval in Class.

## Offline
Drafts live in `mento:db` (single device) and survive reload and offline. The service worker caches the `/h` shell so a
re-open with no network still works (ADR-006).

## Acceptance
- Component: fragment parsing (valid, malformed, extra keys, `lang` preset); name confirm; consent shown once.
- Language switch mid-question keeps the typed answer and the current question (component + e2e).
- Reload mid-homework restores the answers (e2e). Late tagging matches the domain rule at the exact due time.
- Shows no answer key in the DOM or JS state (test inspects the `LinkContext` type and rendered HTML).
- Bundle ≤ 150 KB gzip first load (CI size check).
