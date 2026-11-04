# Performance log

Budgets: SPEC §8. Guard: `npm run size` (first-load JS, gzip, per prerendered route; `noModule` polyfills excluded).
Lighthouse and DevTools traces (slow 4G + 4× CPU) are recorded in Phase 5.

## Phase 5 measurements (2026-11-04), production build, headless Chromium 1243, mobile emulation (412×823 @1.75)

| Route | Lighthouse (DevTools throttling: 4× CPU, 1.6 Mbps, **562 ms per request**) | In-browser, 4× CPU + 1.6 Mbps + **150 ms** latency, demo data loaded |
|---|---|---|
| `/` role chooser | perf 91, LCP 2.9 s, FCP 0.9 s, TBT 250 ms, CLS 0.005 | LCP ≈ 0.52 s |
| `/t` teacher desk | perf 87, LCP 3.5 s, TBT 230 ms, CLS 0 | LCP ≈ 0.55 s |
| `/h` student link | perf 84 (simulated: LCP 3.9 s) | LCP ≈ 0.60 s (valid link), CLS 0 |
| `/t/results` | not run in Lighthouse | LCP ≈ 0.60 s, CLS 0 |
| `/p` principal | not run in Lighthouse | LCP ≈ 0.29 s, CLS 0 |

Lighthouse accessibility 100 and best-practices 96 on all three runs.

**Verdict: the LCP < 2.5 s target is NOT met under Lighthouse's slow-4G profile (2.9-3.9 s); CLS < 0.1 and TBT are fine. It is met (≈ 0.5 s) under a
150 ms-latency profile that is closer to real 4G.** The difference is round trips: Lighthouse charges 562 ms per request, and our content waits on
HTML → main JS → data-layer chunk. Not yet verified on a real low-end phone.

What was tried (measured, not guessed):
| Change | Effect |
|---|---|
| Start loading the data layer at module load, not after hydration | `/h` LCP 4.4 → 3.8 s, TBT 610 → 270 ms. **Kept.** |
| System font for the "हिं" switch label (it pulled a 54 KB Devanagari font onto English pages), drop Nunito 800 (extra-bold uses 700), `experimental.inlineCss` | FCP 1.2 → 0.9 s; LCP unchanged. **Kept.** |
| Bundle the data layer into first load (remove the extra round trip) | `/h` 3.9 → 3.1 s but first-load JS +45 KB (192 KB). **Reverted**: poor trade for weak phones and breaks the JS budget. |

Next levers if this must hit 2.5 s under Lighthouse: render the first screen without waiting for the data layer (static shell per route), split catalogues
by language so English-only links skip Hindi, and a smaller validator on the read path (zod is ~20 KB gz of the deferred chunk).

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

## Budget change 2 (2026-11-04)
`/h` first-load budget 160 → **165 KB** (measured 161.6 KB) after adding the photo answer wiring and the Join flow's shared helpers.
The camera screen and quality heuristics are a separate lazy chunk (not in first load). Still **unverified on slow 4G + 4× CPU**; if Phase 5
shows LCP > 2.5 s, the first cut is splitting the Hindi catalogue out of the first load of English-only links.

## Watch items
- **Total JS on the student route ≈ first load + ~30 KB deferred data layer.** The first-load budget is met, but on slow 4G the deferred chunk delays content behind the skeleton. Phase 5 measures LCP; if it fails, the options are a lighter validator for read paths or validating only on write.
- **`next/link` costs ~4-5 KB.** Keep it off the student route (`/h` tabs are in-page) and out of shared boundaries; use `TopBarFrame` there.
- **Student route headroom (~18 KB).** Keep `/h` imports minimal: `zod/mini`, no catalogue for screens that aren't on `/h`, lazy
  capture/tours/demo overlay. If i18n catalogues push `/h` over, split catalogues per area (`common`, `link`, `teacher`), not per language,
  so a language switch stays instant.
