# Changes in this round

## Added
- `/demo?to=<path>`: one link that opens the demo class at a chosen screen (allowlist of internal paths only; unknown targets go to `/t`). Used by the deck's "Open in live app" links.
- `/present`: a presenter page (Stationery Desk theme) with 20 slides and the real app in a phone frame. Same HTML as the Artifact deck; here the phone is a live same-origin iframe.
- Framing is now allowed for the app's own origin only (`frame-ancestors 'self'`, `X-Frame-Options: SAMEORIGIN`); `/present` also allows data: fonts. See docs/threat-model.md.
- `docs/demo-script-90s.md`, `scripts/deck/` (template and build script).

## Deck notes
- Hands-up room: the presenter counts hands; no backend. Phone-scan live room is not built.
- Each claim on a slide is labelled Built / Preview / Roadmap to match the app.
- Teams' names are not included; add them on the cover.

## Not done yet (app gaps vs the brief)
Students × concepts grid, per-child practice and "fixed it" counter, override of every mark, "Sample class" label, teacher Plans screen with locks, invite-a-teacher, metrics view, school-wide export/delete, in-app /live room.

## Risks
Venue Wi-Fi (use the Artifact screenshots or hands-up mode); Hindi is not native-reviewed; not tested on real phones.
