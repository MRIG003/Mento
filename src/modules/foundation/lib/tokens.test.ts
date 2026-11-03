import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { colors, contrastRatio } from './tokens';

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for a colour on itself', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrastRatio('#2F3FBF', '#2F3FBF')).toBeCloseTo(1, 5);
  });
});

describe('Stationery Desk palette meets WCAG 2.1 AA', () => {
  const text: [string, string, string][] = [
    ['ink on paper', colors.ink, colors.paper],
    ['muted on paper', colors.inkMuted, colors.paper],
    ['ink on card', colors.ink, colors.card],
    ['muted on card', colors.inkMuted, colors.card],
    ['white on primary', colors.card, colors.primary],
    ['ink on sticky note', colors.ink, colors.note],
    ['ink on highlighter', colors.ink, colors.highlight],
    ...(['tagPink', 'tagBlue', 'tagMint', 'tagLilac', 'tagPeach', 'tagYellow'] as const).map(
      (t): [string, string, string] => [`ink on ${t}`, colors.ink, colors[t]],
    ),
  ];
  it.each(text)('%s has at least 4.5:1 for text', (_name, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  const bars: [string, string][] = [['ok', colors.ok], ['warn', colors.warn], ['bad', colors.bad]];
  it.each(bars)('%s bar has at least 3:1 against the white card (non-text contrast)', (_name, c) => {
    expect(contrastRatio(c, colors.card)).toBeGreaterThanOrEqual(3);
  });
});

describe('globals.css stays in sync with tokens.ts', () => {
  const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
  it.each(Object.entries(colors))('defines --color-%s with the same value', (name, value) => {
    const cssName = name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    expect(css).toMatch(new RegExp(`--color-${cssName}:\\s*${value};`, 'i'));
  });
});
