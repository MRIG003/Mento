import { describe, expect, it } from 'vitest';
import { createAutoCapture } from './auto-capture';
import { assess, clippedShare, frameDifference, laplacianVariance, meanLuminance, toGray } from './quality';
import * as img from './test-images.fixtures';

describe('assess: one guidance message at a time, from synthetic frames', () => {
  it('passes a sharp, bright, steady, well-framed page', () => {
    const a = assess(img.sharp(), toGray(img.sharp()));
    expect(a.issue).toBeNull();
    expect(a.ok).toBe(true);
    expect(a.score).toBeGreaterThanOrEqual(0.5);
  });
  it.each([
    ['a dark room', img.dark, 'too-dark'],
    ['glare from a tube light', img.glared, 'glare'],
    ['an out-of-focus page', () => img.blurred(), 'hold-still'],
    ['a page that is too far away', img.far, 'move-closer'],
    ['a page that runs off the edges', img.cropped, 'show-whole-page'],
  ] as const)('flags %s', (_name, make, issue) => {
    const a = assess(make());
    expect(a.issue).toBe(issue);
    expect(a.ok).toBe(false);
    expect(a.score).toBeLessThan(0.5);
  });
  it('flags a moving phone using the previous frame', () => {
    expect(assess(img.moved(), toGray(img.sharp())).issue).toBe('hold-still');
  });
  it('reports darkness before anything else (priority order)', () => {
    expect(assess(img.dark(), toGray(img.sharp())).issue).toBe('too-dark');
  });
  it('skips the steadiness check when the previous frame has another size', () => {
    const small = toGray(img.sharp(), 80);
    expect(assess(img.sharp(), small).metrics.diff).toBeNull();
  });
});

describe('metric functions', () => {
  it('downscale keeps the aspect ratio at ~160 px wide', () => {
    const g = toGray(img.sharp());
    expect([g.width, g.height]).toEqual([160, 120]);
  });
  it('blur lowers the Laplacian variance a lot', () => {
    expect(laplacianVariance(toGray(img.blurred()))).toBeLessThan(laplacianVariance(toGray(img.sharp())) / 10);
  });
  it('mean, clipping and difference behave on simple frames', () => {
    const g = toGray(img.sharp());
    expect(meanLuminance(toGray(img.dark()))).toBeLessThan(meanLuminance(g));
    expect(clippedShare(toGray(img.glared()))).toBeGreaterThan(0.04);
    expect(frameDifference(g, g)).toBe(0);
  });
});

describe('createAutoCapture', () => {
  it('fires once after three good frames in a row, and restarts after a bad one', () => {
    const auto = createAutoCapture();
    expect([true, true, false, true, true, true, true].map((ok) => auto.feed(ok))).toEqual([false, false, false, false, false, true, false]);
  });
});
