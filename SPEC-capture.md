# SPEC-capture

Module id: `capture` · Depends on: `foundation`, `data`, `services` · Lazy-loaded (`next/dynamic`, `ssr: false` inside a client component)

## Objective
Help a parent take a readable notebook photo on a cheap phone, with live, kind, one-at-a-time guidance. The AI reading
is Preview; the guidance and teacher review are real.

## Pure heuristics (`lib/quality.ts`, unit-tested on synthetic ImageData; ADR-003)
Frames are downscaled to ~160 px wide grayscale on a canvas before scoring.

| Check | Measure | Initial threshold (calibrate in slice 2b, documented) | Message |
|---|---|---|---|
| Dark | mean luminance (Rec. 601) | < 70 / 255 | "Too dark, move near a light" |
| Glare | share of pixels ≥ 250 | > 4% | "Tilt slightly, there is glare" |
| Blur | variance of a 3×3 Laplacian | < 60 | "Hold still" (if moving) or "Move closer" |
| Steadiness | mean abs difference to the previous frame | > 12 | "Hold still" |
| Framing | bounding box of strong edges (Sobel > t) vs frame | box < 55% of the area → "Move closer"; touching ≥ 3 edges → "Show the whole page" | |

`assess(frame, prev) → { ok: boolean; score: 0..1; issue?: Issue }` where one issue is chosen by priority
dark > glare > steadiness > framing > blur. Auto-capture when `ok` holds for 3 consecutive assessed frames (~600 ms).

## Capture screen
- The camera starts **only on a tap** ("Start camera"). `getUserMedia({ video: { facingMode: 'environment' } })`.
  Torch button only when `track.getCapabilities().torch` is true (`applyConstraints({ advanced: [{ torch: true }] })`, to
  verify on MDN in slice 8).
- One message at a time, in a live region (`aria-live="polite"`), throttled to one change per 1.2 s.
- One-time tip "Wipe the camera lens first". Manual shutter is always available.
- After capture: quality score as words ("Clear" / "Might be hard to read") + "Retake?" with the reason; **submit still allowed**.
- **Cleanup:** stop all tracks on unmount, `visibilitychange` hidden and route change; revoke object URLs.
- **Fallback:** camera denied or unavailable → file picker (`accept="image/jpeg,image/png,image/webp"`, ≤ 10 MB, type sniffed by magic bytes).
- **Store:** re-encode via canvas (≤ 1600 px, JPEG ~0.7), which drops EXIF/GPS; the blob goes to `BlobStore`; score < 0.5 → "needs teacher review".
- HandwritingReader (Preview) suggestion shown to the teacher in Review with a Preview badge.

## Acceptance
- Unit: synthetic dark, glared, blurred (box-blurred checkerboard), shaky (shifted pair) and sharp, framed images each produce
  the expected issue / ok. Thresholds live in one constants file.
- Unit: the re-encoded output has no EXIF (APP1) marker; oversize/wrong-type files are rejected with bilingual errors.
- Component: tracks stopped on unmount (fake MediaStream).
