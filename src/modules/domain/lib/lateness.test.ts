import { describe, expect, it } from 'vitest';
import { isLate } from './lateness';

describe('isLate', () => {
  const due = '2026-11-04T14:30:00.000Z';
  it('is on time exactly at the due moment', () => expect(isLate('2026-11-04T14:30:00.000Z', due)).toBe(false));
  it('is late one millisecond after', () => expect(isLate('2026-11-04T14:30:00.001Z', due)).toBe(true));
  it('is on time before', () => expect(isLate('2026-11-04T09:00:00.000Z', due)).toBe(false));
  it('compares instants, not text, across time zones', () => {
    expect(isLate('2026-11-04T20:00:00.000+05:30', due)).toBe(false);
    expect(isLate('2026-11-04T20:00:01.000+05:30', due)).toBe(true);
  });
});
