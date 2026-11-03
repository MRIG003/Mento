import { ANALYSIS_WIDTH, THRESHOLDS as T } from './thresholds';

/** RGBA pixels, structurally compatible with the DOM ImageData (so tests can run in Node). */
export type Frame = { width: number; height: number; data: Uint8ClampedArray };
export type Gray = { width: number; height: number; data: Float32Array };

export type Issue = 'too-dark' | 'glare' | 'hold-still' | 'show-whole-page' | 'move-closer';
export type Metrics = { mean: number; glareShare: number; diff: number | null; boxShare: number; bordersTouched: number; blurVariance: number };
export type Assessment = { ok: boolean; score: number; issue: Issue | null; metrics: Metrics; gray: Gray };

/** Downscale to ~160 px wide grayscale (Rec. 601 luma), box-averaging each target pixel. */
export function toGray(frame: Frame, targetWidth: number = ANALYSIS_WIDTH): Gray {
  const scale = Math.max(1, frame.width / targetWidth);
  const width = Math.max(1, Math.round(frame.width / scale));
  const height = Math.max(1, Math.round(frame.height / scale));
  const out = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    const y0 = Math.floor(y * scale);
    const y1 = Math.min(frame.height, Math.floor((y + 1) * scale));
    for (let x = 0; x < width; x += 1) {
      const x0 = Math.floor(x * scale);
      const x1 = Math.min(frame.width, Math.floor((x + 1) * scale));
      let sum = 0;
      let n = 0;
      for (let sy = y0; sy < Math.max(y1, y0 + 1); sy += 1) {
        for (let sx = x0; sx < Math.max(x1, x0 + 1); sx += 1) {
          const i = (sy * frame.width + sx) * 4;
          sum += 0.299 * (frame.data[i] ?? 0) + 0.587 * (frame.data[i + 1] ?? 0) + 0.114 * (frame.data[i + 2] ?? 0);
          n += 1;
        }
      }
      out[y * width + x] = sum / n;
    }
  }
  return { width, height, data: out };
}

const at = (g: Gray, x: number, y: number) => g.data[y * g.width + x] ?? 0;

export function meanLuminance(g: Gray): number {
  let sum = 0;
  for (const v of g.data) sum += v;
  return sum / g.data.length;
}

export function clippedShare(g: Gray, threshold: number = T.clippedValue): number {
  let n = 0;
  for (const v of g.data) if (v >= threshold) n += 1;
  return n / g.data.length;
}

/** Variance of the 4-neighbour Laplacian: low = blurry. */
export function laplacianVariance(g: Gray): number {
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < g.height - 1; y += 1) {
    for (let x = 1; x < g.width - 1; x += 1) {
      const l = at(g, x - 1, y) + at(g, x + 1, y) + at(g, x, y - 1) + at(g, x, y + 1) - 4 * at(g, x, y);
      sum += l;
      sumSq += l * l;
      n += 1;
    }
  }
  if (n === 0) return 0;
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

/** Mean absolute difference between two frames of the same size: high = the phone is moving. */
export function frameDifference(a: Gray, b: Gray): number | null {
  if (a.width !== b.width || a.height !== b.height) return null;
  let sum = 0;
  for (let i = 0; i < a.data.length; i += 1) sum += Math.abs((a.data[i] ?? 0) - (b.data[i] ?? 0));
  return sum / a.data.length;
}

/** Bounding box of strong Sobel edges: how much of the frame the page's content covers, and which borders it touches. */
export function edgeBox(g: Gray): { boxShare: number; bordersTouched: number } {
  let minX = g.width;
  let minY = g.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 1; y < g.height - 1; y += 1) {
    for (let x = 1; x < g.width - 1; x += 1) {
      const gx = at(g, x + 1, y - 1) + 2 * at(g, x + 1, y) + at(g, x + 1, y + 1) - at(g, x - 1, y - 1) - 2 * at(g, x - 1, y) - at(g, x - 1, y + 1);
      const gy = at(g, x - 1, y + 1) + 2 * at(g, x, y + 1) + at(g, x + 1, y + 1) - at(g, x - 1, y - 1) - 2 * at(g, x, y - 1) - at(g, x + 1, y - 1);
      if (Math.hypot(gx, gy) > T.edgeMagnitude) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return { boxShare: 0, bordersTouched: 0 };
  const m = T.borderMargin + 1; // Sobel cannot see the outermost pixel row
  const bordersTouched = [minX <= m, minY <= m, maxX >= g.width - 1 - m, maxY >= g.height - 1 - m].filter(Boolean).length;
  return { boxShare: ((maxX - minX + 1) * (maxY - minY + 1)) / (g.width * g.height), bordersTouched };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Assess one camera frame. One issue at a time, by priority: dark > glare > hold still > framing > blur.
 * `previous` is the previous frame's gray image (for steadiness).
 */
export function assess(frame: Frame, previous?: Gray): Assessment {
  const gray = toGray(frame);
  const mean = meanLuminance(gray);
  const glare = clippedShare(gray);
  const diff = previous ? frameDifference(gray, previous) : null;
  const { boxShare, bordersTouched } = edgeBox(gray);
  const blurVariance = laplacianVariance(gray);
  const metrics: Metrics = { mean, glareShare: glare, diff, boxShare, bordersTouched, blurVariance };

  let issue: Issue | null = null;
  if (mean < T.darkMean) issue = 'too-dark';
  else if (glare > T.glareShare) issue = 'glare';
  else if (diff !== null && diff > T.shakeDiff) issue = 'hold-still';
  else if (bordersTouched >= T.croppedBorders) issue = 'show-whole-page';
  else if (boxShare < T.minBoxShare) issue = 'move-closer';
  else if (blurVariance < T.blurVariance) issue = 'hold-still';

  const parts = [
    clamp01(mean / T.darkMean),
    clamp01(1 - glare / (2 * T.glareShare)),
    diff === null ? 1 : clamp01(1 - diff / (2 * T.shakeDiff)),
    clamp01(boxShare / T.minBoxShare) * (bordersTouched >= T.croppedBorders ? 0.5 : 1),
    clamp01(blurVariance / (2 * T.blurVariance)),
  ];
  const score = Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100) / 100;
  return { ok: issue === null, score: issue === null ? Math.max(score, 0.5) : Math.min(score, 0.49), issue, metrics, gray };
}
