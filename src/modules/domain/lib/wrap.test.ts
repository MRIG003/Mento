import { describe, expect, it } from 'vitest';
import { buildEveningWrap } from './wrap';

const due = '2026-11-04T14:30:00.000Z';
const concepts = [
  { conceptId: 'c_add', stuckCount: 1, counts: { attempted: 80, correct: 66 } },
  { conceptId: 'c_compare', stuckCount: 6, counts: { attempted: 96, correct: 39 } },
  { conceptId: 'c_equiv', stuckCount: 6, counts: { attempted: 64, correct: 41 } },
];

describe('buildEveningWrap', () => {
  it('waits while the homework is still open and fewer than 75% have submitted', () => {
    expect(buildEveningWrap({ now: '2026-11-04T10:00:00.000Z', dueAt: due, submitted: 20, total: 40, concepts, practiceSentFor: [] }))
      .toEqual({ kind: 'waiting', submitted: 20, total: 40 });
  });
  it('after the due time, focuses on the concept with the most stuck children (tie: lower class rate)', () => {
    expect(buildEveningWrap({ now: '2026-11-04T15:00:00.000Z', dueAt: due, submitted: 32, total: 40, concepts, practiceSentFor: [] }))
      .toEqual({ kind: 'focus', conceptId: 'c_compare', stuckCount: 6, practiceSent: false });
  });
  it('does not wait once 75% have submitted, even before the due time', () => {
    expect(buildEveningWrap({ now: '2026-11-04T10:00:00.000Z', dueAt: due, submitted: 30, total: 40, concepts, practiceSentFor: ['c_compare'] }))
      .toMatchObject({ kind: 'focus', conceptId: 'c_compare', practiceSent: true });
  });
  it('is all clear when nobody is stuck', () => {
    expect(buildEveningWrap({ now: '2026-11-04T15:00:00.000Z', dueAt: due, submitted: 40, total: 40, concepts: concepts.map((c) => ({ ...c, stuckCount: 0 })), practiceSentFor: [] }))
      .toEqual({ kind: 'all-clear' });
  });
});
