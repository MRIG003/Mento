# Mento

Homework that tells a teacher who is stuck, on which concept, and what to do next.
Mobile-first web app for Classes 3-8 in affordable private schools in India. English and Hindi.

Status: Phase 2 (spec awaiting approval: SPEC.md, SPEC-<module>.md, docs/threat-model.md, docs/decisions/).
Everything shown in the app will be demo data; simulated features will be labelled Preview.

## Phase 0 decisions and defaults

| Topic | Decision |
|---|---|
| Repo | github.com/MRIG003/Mento. All work on branch `claude/friendly-bell-d1p91z`, small atomic commits; PR into main only on request. |
| Deploy | Vercel, deployed by Claude at Phase 6 after the owner approves CHECKPOINT 4. Preview deploys allowed earlier. |
| Name | "Mento" kept for v1. Name lives in one constant + i18n files so a rename is cheap. **Needs a trademark check before public launch**: mento.co (US coaching platform), a 2020 Bengaluru edtech "Mento", "Mento Tech", Mento Protocol (crypto) and Mentos (candy) exist. IP India registry not searched. |
| Node | 22 LTS (container has 22.23). |
| Locale default | Guess from browser language; `hi*` -> Hindi, else English. |
| Dates/numbers | Indian formatting (en-IN / hi-IN), Asia/Kolkata display. |
| Fonts | Nunito, Caveat, Noto Sans Devanagari, self-hosted, Latin + Devanagari subsets. |
