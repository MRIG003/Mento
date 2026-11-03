/**
 * Stationery Desk palette (SPEC-foundation). Single source of truth for tests; globals.css mirrors these values
 * and tokens.test.ts fails if the two drift.
 */
export const colors = {
  paper: '#F3EBDD',
  dot: '#D6C9B2',
  note: '#FFE58A',
  washi: '#F7B2C4',
  highlight: '#FFEB3B',
  tagPink: '#F8C8D6',
  tagBlue: '#BFE0F7',
  tagMint: '#BDEBD2',
  tagLilac: '#D9CCF5',
  tagPeach: '#FAD3B0',
  tagYellow: '#FFE58A',
  primary: '#2F3FBF',
  primaryPressed: '#24319A',
  ink: '#2B2B2B',
  inkMuted: '#5A5A52',
  card: '#FFFFFF',
  line: '#E4D9C6',
  ok: '#2E7D4F',
  warn: '#B26A00',
  bad: '#C62828',
} as const;

export type ColorToken = keyof typeof colors;

/** WCAG 2.1 relative luminance of an sRGB hex colour (https://www.w3.org/TR/WCAG21/#dfn-relative-luminance). */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colours, from 1 to 21. */
export function contrastRatio(foreground: string, background: string): number {
  const [hi, lo] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}
