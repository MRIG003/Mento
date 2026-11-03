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
