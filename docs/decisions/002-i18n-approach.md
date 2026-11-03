# ADR-002: Own typed i18n runtime, client language state, no locale routes

## Status
Accepted (Phase 2), 2026-11-03

## Context
The language switch must be one tap, with no reload and no navigation, keeping scroll and typed answers, on every screen. Only two
languages in v1. The app is statically prerendered and data is client-side.

## Decision
- Catalogues `en.ts` (`as const`, source of truth) and `hi.ts` typed `Record<keyof typeof en, string>`, so missing keys fail compilation;
  a runtime test also checks parity and placeholders.
- A tiny `t()` with `{param}` interpolation and one/other plurals; `Intl` for numbers and dates (`en-IN`, `hi-IN`).
- The language lives in React context; switching updates context, `html[lang]` and `mento:prefs`. No route change, so component state survives.
- Initial language: fragment `lang` → device pref → `navigator.languages` → en. The prerendered HTML shows a language-neutral paper
  skeleton for content until the client resolves the language (avoids a wrong-language flash; skeleton reserves space for CLS).
- Bilingual content fields with graceful fallback and a visible note.

## Alternatives considered
- **next-intl or locale segments (`/hi/...`):** switching means navigation, risking lost input and scroll; the extra dependency is unneeded for 2 languages. Rejected.
- **Inline pre-hydration script to set the language** (Next guide "preventing flash before hydration"): conflicts with a strict `script-src` CSP (ADR-008). Rejected.
- **i18next/react-i18next:** larger bundle than needed for the student route budget. Rejected.

## Consequences
The first paint of the content area is a skeleton for one frame on cold loads. All Hindi needs native-speaker review (README).
