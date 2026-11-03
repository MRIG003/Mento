import { describe, expect, it } from 'vitest';
import { clamp } from './clamp';

describe('clamp', () => {
  it('returns the value when it is inside the range', () => expect(clamp(5, 0, 10)).toBe(5));
  it('raises values below the minimum', () => expect(clamp(-3, 0, 10)).toBe(0));
  it('lowers values above the maximum', () => expect(clamp(12, 0, 10)).toBe(10));
});
