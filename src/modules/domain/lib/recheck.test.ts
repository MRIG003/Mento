import { describe, expect, it } from 'vitest';
import { recheckDelta, unstuckCount } from './recheck';

describe('recheckDelta', () => {
  it('marks a student unstuck only when they move from stuck to on-track', () => {
    const before = new Map([['s1', 'stuck'], ['s2', 'stuck'], ['s3', 'stuck'], ['s4', 'on-track']] as const);
    const after = new Map([['s1', 'on-track'], ['s2', 'stuck'], ['s3', 'not-enough-evidence'], ['s4', 'on-track']] as const);
    const delta = recheckDelta(before, after);
    expect(delta).toEqual([
      { studentId: 's1', before: 'stuck', after: 'on-track', unstuck: true },
      { studentId: 's2', before: 'stuck', after: 'stuck', unstuck: false },
      { studentId: 's3', before: 'stuck', after: 'not-enough-evidence', unstuck: false },
      { studentId: 's4', before: 'on-track', after: 'on-track', unstuck: false },
    ]);
    expect(unstuckCount(delta)).toBe(1);
  });
  it('treats a student with no re-check answers as not enough evidence yet', () => {
    expect(recheckDelta(new Map([['s1', 'stuck']]), new Map())).toEqual([{ studentId: 's1', before: 'stuck', after: 'not-enough-evidence', unstuck: false }]);
  });
});
