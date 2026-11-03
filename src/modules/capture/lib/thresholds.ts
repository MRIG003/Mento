/**
 * Photo-quality thresholds (ADR-003). One file so calibration is a one-line change.
 * Values are on a ~160 px wide grayscale frame (0-255). Calibrated on synthetic images in T15; re-check with real
 * notebook photos on low-end phones before launch.
 */
export const ANALYSIS_WIDTH = 160;
export const THRESHOLDS = {
  /** mean luminance below this → "Too dark, move near a light" */
  darkMean: 70,
  /** a pixel counts as clipped at or above this value */
  clippedValue: 250,
  /** share of clipped pixels above this → "Tilt slightly, there is glare" */
  glareShare: 0.04,
  /** mean absolute difference to the previous frame above this → "Hold still" */
  shakeDiff: 12,
  /** Sobel magnitude above this counts as an edge pixel */
  edgeMagnitude: 120,
  /** edge bounding box smaller than this share of the frame → "Move closer" */
  minBoxShare: 0.55,
  /** edges within this many px of a border count as touching it; ≥ 3 borders → "Show the whole page" */
  borderMargin: 2,
  croppedBorders: 3,
  /** variance of the Laplacian below this → blurry ("Hold still") */
  blurVariance: 600, // synthetic: sharp ≈ 8,800, box-blurred (r=5) ≈ 250 (T15)
  /** consecutive good frames before auto-capture (~600 ms at 5 fps) */
  autoCaptureFrames: 3,
} as const;
