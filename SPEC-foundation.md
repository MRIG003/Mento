# SPEC-foundation

Module id: `foundation` · Depends on: none · Consumers: every UI module.

## Objective
The Stationery Desk look, the app shell, and frictionless bilingual UI, so every other module can build screens
from primitives without inventing styles or strings.

## Design tokens (CSS variables in `globals.css` via Tailwind v4 `@theme`)

| Token | Value | Use |
|---|---|---|
| `--color-paper` | #F3EBDD | page background |
| `--color-dot` | #D6C9B2 | dot grid: `radial-gradient(var(--color-dot) 1px, transparent 1px) 0 0 / 20px 20px` |
| `--color-note` | #FFE58A | headline sticky note |
| `--color-washi` | #F7B2C4 | washi tape strip |
| `--color-highlight` | #FFEB3B | highlighter swipe behind the weak concept |
| `--color-tag-pink/blue/mint/lilac/peach/yellow` | #F8C8D6 / #BFE0F7 / #BDEBD2 / #D9CCF5 / #FAD3B0 / #FFE58A | student name tags |
| `--color-primary` | #2F3FBF | primary pill (white text, 56 px high) |
| `--color-ink` | #2B2B2B | body text on paper |
| `--color-ink-muted` | #5A5A52 | muted text (≥ 4.5:1 on paper, verified by a contrast unit test) |
| `--color-card` | #FFFFFF | cards |
| `--color-ok / warn / bad` | chosen in slice 1 to hit ≥ 3:1 for bars against white | progress bars, always paired with words |
| `--font-ui` | Nunito | UI |
| `--font-hand` | Caveat | handwritten accents, **English only** (Hindi uses Noto Sans Devanagari) |
| `--font-deva` | Noto Sans Devanagari | all Hindi text; `line-height ≥ 1.6` so matras never clip |
| `--rotate-note` | -1.5deg | sticky note tilt; tags use −3° to +3° chosen deterministically from the student id |
| `--shadow-note` | soft two-layer shadow | notes, tags |
| `--radius-card / pill` | 16px / 9999px | |
| `--tap-min` | 44px | minimum target; primary buttons 56px |

Motion: `transform`/`opacity` only, 150-400 ms; `@media (prefers-reduced-motion: reduce)` disables rotations' settle,
peel, swipe and stagger (end states shown statically).

## Primitives (all typed, all keyboard-accessible)
`Button` (primary pill / secondary / quiet), `StickyNote` (+ `WashiTape`), `Card`, `NameTag`, `HighlighterMark`,
`ProgressBar` (bar + % + status word), `Badge` (`DemoData`, `Preview`, `Late`), `StatusWord` (stuck / getting there /
on track / not enough answers yet), `EmptyState`, `PaperSkeleton`, `CoachMark` (spotlight, max 4 per screen, Esc to
close, focus-trapped, returns focus), `LanguageSwitch`, `TopBar`, `TabBar` (per role), `Fraction` (renders `a/b` stacked
with an accessible label "3 over 4" / "4 में से 3"), `Sheet` (bottom sheet dialog), `Field` (label + hint + error, linked by
`aria-describedby`).

## i18n
- Catalogues `src/i18n/en.ts` (source of truth, `as const`) and `src/i18n/hi.ts` typed as `Record<keyof typeof en, string>`,
  so a missing Hindi key is a **compile error**. A runtime parity test also checks both directions and placeholder parity
  (`{count}` present in both).
- `t(key, params)` with ICU-lite plurals (`one`/`other` for en; Hindi uses `other` in most cases, confirmed in review).
- `I18nProvider` holds `lang` in React state (+ `useSyncExternalStore` over device prefs). Switching sets state,
  `document.documentElement.lang`, persists to `mento:prefs`, and **does not navigate**. Because all screens read
  strings via `t`, the re-render keeps component state (typed answers, scroll).
- Initial language: URL fragment `lang` (student link) → device pref → `navigator.languages` (`hi*` → hi) → en.
- Prerender: static HTML renders a language-neutral paper skeleton for the content area until the client resolves the
  language in the first effect. The skeleton reserves layout so CLS stays < 0.1 (ADR-002).
- Bilingual content: `pick(bilingual, lang)` returns `{ text, lang, fallback: boolean }`; the UI marks fallbacks with a
  small "English only" / "सिर्फ़ हिन्दी में" note.
- No hardcoded strings: ESLint `react/jsx-no-literals` (allowing punctuation and the `EN | हिं` labels).

## Shell
- `TopBar`: back (where it makes sense), screen title, **LanguageSwitch (`EN | हिं`, ≥ 44 px, `aria-pressed`)**, Help
  (replays the tour for the current screen), Demo badge when demo mode is on.
- `TabBar` per role: Teacher **Desk · Create · Results · Class**; Principal **Overview · Gaps · Classes · Plan**;
  Student **Today · Practice · My progress**. Bottom-fixed, safe-area padding, targets ≥ 48 px, labels shown along with icons.
- Icons: a handful of inline SVG components (pencil, desk, results, class, help, camera, torch), `aria-hidden` with text labels.
- Route `error.tsx` and `not-found.tsx` with bilingual copy; `loading.tsx` uses `PaperSkeleton`.
- Fonts via `next/font/local` from `src/fonts` (woff2 Latin + Devanagari subsets), `display: 'swap'`.

## Acceptance
- Every primitive has component tests for its states; `LanguageSwitch` test: typing in a field, switching language,
  and the typed value and focus remain.
- Contrast unit test computes WCAG ratios for ink/muted/primary/white pairs from the token values.
- Shell renders at 390 px with no horizontal overflow in en and hi (Playwright).
- `html[lang]` updates on switch (test).
