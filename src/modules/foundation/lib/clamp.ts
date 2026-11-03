/** Keep a value inside [min, max]. Used by sliders, text size and rotation helpers. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
