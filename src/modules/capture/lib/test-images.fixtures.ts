/** Synthetic camera frames for heuristic tests (no real photos, no children's data). */
import type { Frame } from './quality';

type Painter = (x: number, y: number) => number;

function frameFrom(width: number, height: number, paint: Painter): Frame {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const v = paint(x, y);
      const i = (y * width + x) * 4;
      data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 255;
    }
  }
  return { width, height, data };
}

const W = 320;
const H = 240;

/** A notebook page with ruled text lines, filling most of the frame with a margin of desk around it. */
export function pageFrame(opts: { margin?: number; brightness?: number; shiftX?: number } = {}): Frame {
  const margin = opts.margin ?? 0.08;
  const k = opts.brightness ?? 1;
  const shift = opts.shiftX ?? 0;
  const x0 = Math.round(W * margin) + shift;
  const x1 = Math.round(W * (1 - margin)) + shift;
  const y0 = Math.round(H * margin);
  const y1 = Math.round(H * (1 - margin));
  return frameFrom(W, H, (x, y) => {
    let v = 95; // desk
    if (x >= x0 && x < x1 && y >= y0 && y < y1) {
      v = 215; // paper
      const inText = x > x0 + 10 && x < x1 - 10 && y > y0 + 10 && y < y1 - 10;
      const line = (y - y0) % 14 < 3;
      const word = Math.floor((x - x0 + (Math.floor((y - y0) / 14) * 7)) / 18) % 4 !== 3;
      if (inText && line && word) v = 30; // ink
    }
    return v * k;
  });
}

export const sharp = () => pageFrame();
export const dark = () => pageFrame({ brightness: 0.25 });
export const far = () => pageFrame({ margin: 0.3 });
export const moved = () => pageFrame({ shiftX: 12 });

/** The camera is so close that the page's text runs off every edge. */
export function cropped(): Frame {
  return frameFrom(W, H, (x, y) => ((y % 14 < 3) && Math.floor((x + Math.floor(y / 14) * 7) / 18) % 4 !== 3 ? 30 : 215));
}

/** A bright reflection over part of the page. */
export function glared(): Frame {
  const base = pageFrame();
  for (let y = 60; y < 140; y += 1) for (let x = 120; x < 220; x += 1) {
    const i = (y * W + x) * 4;
    base.data[i] = 255; base.data[i + 1] = 255; base.data[i + 2] = 255;
  }
  return base;
}

/** Box blur of the sharp page (out of focus). */
export function blurred(radius = 5): Frame {
  const src = pageFrame();
  const out = new Uint8ClampedArray(src.data.length);
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) {
    let sum = 0; let n = 0;
    for (let dy = -radius; dy <= radius; dy += 1) for (let dx = -radius; dx <= radius; dx += 1) {
      const sx = Math.min(W - 1, Math.max(0, x + dx)); const sy = Math.min(H - 1, Math.max(0, y + dy));
      sum += src.data[(sy * W + sx) * 4] ?? 0; n += 1;
    }
    const i = (y * W + x) * 4; const v = sum / n;
    out[i] = v; out[i + 1] = v; out[i + 2] = v; out[i + 3] = 255;
  }
  return { width: W, height: H, data: out };
}
