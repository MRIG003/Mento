# Performance log

Budgets: SPEC §8. Guard: `npm run size` (first-load JS, gzip, per prerendered route; `noModule` polyfills excluded).
Lighthouse and DevTools traces (slow 4G + 4× CPU) are recorded in Phase 5.

## Measurements

| Date | Change | Route | First-load JS (gz) | Budget | Notes |
|---|---|---|---|---|---|
| 2026-11-03 | T10: root error/not-found/loading boundaries ship on every route; ButtonLink and the TopBar back link moved out so boundaries don't pull `next/link` | `/` · `/t/*` | 137.9 · 143.1 KB | 150 · 200 KB | Boundaries first cost +9.4 KB (144.1); measured each: not-found 4.7, error 4.0, loading 0.5. |
| 2026-11-03 | T7 + `"sideEffects": ["*.css"]` so the module barrels tree-shake | `/` · `/t/*` | 134.7 · 139.8 KB | 150 · 200 KB | Before the fix, `/` carried shell code it never uses (139.2 KB). |
| 2026-11-03 | T6: + i18n runtime (both catalogues) | `/` | 134.5 KB | 150 KB | +2.3 KB. |
| 2026-11-03 | T4 baseline: Next 16.4.2 + React 19.3.1, near-empty client page | `/` | 132.2 KB | 150 KB | Framework floor. Leaves ~18 KB for app code on the student route. |

## Watch items
- **`next/link` costs ~4-5 KB.** Keep it off the student route (`/h` tabs are in-page) and out of shared boundaries; use `TopBarFrame` there.
- **Student route headroom (~18 KB).** Keep `/h` imports minimal: `zod/mini`, no catalogue for screens that aren't on `/h`, lazy
  capture/tours/demo overlay. If i18n catalogues push `/h` over, split catalogues per area (`common`, `link`, `teacher`), not per language,
  so a language switch stays instant.
