# ADR-003: On-device photo quality heuristics as pure functions over ImageData

## Status
Accepted (Phase 2), 2026-11-03. Thresholds are *initial*; calibrated in slice 2b with synthetic and real sample photos and recorded here.

## Context
Parents on low-end phones take notebook photos in poor light. Guidance must be live, on-device (privacy, no network), cheap enough for
4× CPU throttling, and testable without a camera.

## Decision
Downscale frames to ~160 px grayscale and compute: mean luminance (dark), share of clipped highlights ≥ 250 (glare), Laplacian
variance (blur), mean absolute frame difference (steadiness), and Sobel edge bounding box (framing). One issue is shown at a time, by
priority dark > glare > steadiness > framing > blur. Auto-capture after 3 consecutive OK frames. Implemented as pure functions
`(ImageData, prev?) → Assessment`, unit-tested on synthetic images.

## Alternatives considered
- **ML document detection (TF.js / OpenCV.js):** accurate framing, but 1-8 MB of downloads and slow on low-end CPUs. Rejected for v1.
- **No live guidance, check after capture only:** simpler, but more retakes and worse photos. Rejected; it's a headline requirement.

## Consequences
Framing via edges is approximate on busy backgrounds; the manual shutter and "submit anyway" remain available. Assessment runs at ≤ 5 fps.

## Calibration (T15, 2026-11-03), synthetic frames only
Measured on 320×240 synthetic frames (ruled page on a desk), analysed at 160×120:

| Frame | mean | glare share | diff vs prev | edge box | borders touched | Laplacian var | → |
|---|---|---|---|---|---|---|---|
| sharp page | 162 | 0 | – | 0.74 | 0 | 8,828 | ok |
| dark (×0.25) | 41 | 0 | – | 0.56 | 0 | 546 | too dark |
| far (30% margin) | 111 | 0 | – | 0.17 | 0 | 2,181 | move closer |
| cropped (text off all edges) | 184 | 0 | – | 0.97 | 4 | 13,352 | show whole page |
| glare (255 blob) | 169 | 0.104 | – | 0.74 | 0 | 7,458 | glare |
| box blur r=5 | 162 | 0 | – | 0.76 | 0 | 248 | hold still |
| shifted 12 px | 162 | 0 | 16.3 | 0.74 | 0 | 8,828 | hold still |

Change from the initial guess: `blurVariance` 60 → **600**. At 60 a blurred page passed. The other thresholds already separate
the cases with margin. **Not yet verified on real phone photos**: real notebook photos have lower contrast than synthetic ink,
so the blur and edge thresholds may need lowering. This is a Phase 5 item, and the manual shutter plus "submit anyway" stay as the safety net.
