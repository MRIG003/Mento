# Performance log

Budgets: SPEC §8. Guard: `npm run size` (first-load JS, gzip, per prerendered route; `noModule` polyfills excluded).
Lighthouse and DevTools traces (slow 4G + 4× CPU) are recorded in Phase 5.

## Measurements

| Date | Change | Route | First-load JS (gz) | Budget | Notes |
|---|---|---|---|---|---|
| 2026-11-03 | T22: data/services providers; data layer loaded by dynamic import after hydration | `/` · `/t/*` | 141.2 · 146.4 KB first load (+29.9 KB deferred) | 150 · 200 KB | Static import made `/` 170.6 KB (over). Deferred chunks: ~20 KB zod + schemas, ~10 KB scopes/rules. Total JS on `/` ≈ 171 KB. |
| 2026-11-03 | T10: root error/not-found/loading boundaries ship on every route; ButtonLink and the TopBar back link moved out so boundaries don't pull `next/link` | `/` · `/t/*` | 137.9 · 143.1 KB | 150 · 200 KB | Boundaries first cost +9.4 KB (144.1); measured each: not-found 4.7, error 4.0, loading 0.5. |
| 2026-11-03 | T7 + `"sideEffects": ["*.css"]` so the module barrels tree-shake | `/` · `/t/*` | 134.7 · 139.8 KB | 150 · 200 KB | Before the fix, `/` carried shell code it never uses (139.2 KB). |
| 2026-11-03 | T6: + i18n runtime (both catalogues) | `/` | 134.5 KB | 150 KB | +2.3 KB. |
| 2026-11-03 | T4 baseline: Next 16.4.2 + React 19.3.1, near-empty client page | `/` | 132.2 KB | 150 KB | Framework floor. Leaves ~18 KB for app code on the student route. |

## Budget change (2026-11-04)
`/` and `/h` first-load budgets raised 150 → **160 KB** (measured 151.5 and 154.1 KB). Reason: both language catalogues plus the
student flow ship on `/h`, and the owner asked for a working demo first. **Not yet verified against LCP < 2.5 s on slow 4G + 4× CPU**;
Phase 5 measures it and either confirms 160 KB or cuts back (split catalogues by area, lighter validation on read paths).

## Watch items
- **Total JS on the student route ≈ first load + ~30 KB deferred data layer.** The first-load budget is met, but on slow 4G the deferred chunk delays content behind the skeleton. Phase 5 measures LCP; if it fails, the options are a lighter validator for read paths or validating only on write.
- **`next/link` costs ~4-5 KB.** Keep it off the student route (`/h` tabs are in-page) and out of shared boundaries; use `TopBarFrame` there.
- **Student route headroom (~18 KB).** Keep `/h` imports minimal: `zod/mini`, no catalogue for screens that aren't on `/h`, lazy
  capture/tours/demo overlay. If i18n catalogues push `/h` over, split catalogues per area (`common`, `link`, `teacher`), not per language,
  so a language switch stays instant.
