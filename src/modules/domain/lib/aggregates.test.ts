import { describe, expect, it } from 'vitest';
import { isActiveTeacher, isDashboardUnlocked, schoolAggregates } from './aggregates';

const input = {
  teachers: [
    { publishedInLast7Days: true, openedResultsAfterCheck: true },
    { publishedInLast7Days: true, openedResultsAfterCheck: false },
    { publishedInLast7Days: false, openedResultsAfterCheck: true },
  ],
  homeworkSet: 5,
  expectedSubmissions: 106,
  actualSubmissions: 80,
  cells: [
    { classLabel: '6B', subjectId: 'maths', counts: { attempted: 256, correct: 150 }, weakestConceptId: 'c_compare' },
    { classLabel: '6A', subjectId: 'maths', counts: { attempted: 200, correct: 150 }, weakestConceptId: 'c_dec' },
    { classLabel: '5A', subjectId: 'hindi', counts: { attempted: 2, correct: 0 } },
  ],
  practiceSent: 2,
  practiceCompleted: 1,
  parentReportsOpened: 12,
};

describe('active teacher', () => {
  it('means a completed homework workflow this week, not just logging in', () => {
    expect(input.teachers.map(isActiveTeacher)).toEqual([true, false, false]);
  });
});

describe('isDashboardUnlocked', () => {
  it.each([[2, 'free', false], [3, 'free', true], [0, 'school', true]] as const)('%i active teachers on %s plan → %s', (n, plan, expected) => {
    expect(isDashboardUnlocked(plan, n)).toBe(expected);
  });
});

describe('schoolAggregates', () => {
  const out = schoolAggregates(input);
  it('counts and rates, with the biggest gap as the headline', () => {
    expect(out.activeTeachers).toBe(1);
    expect(out.submissionRate).toBe(75);
    expect(out.headline).toEqual({ classLabel: '6B', subjectId: 'maths' });
    expect(out.gapCells[0]).toEqual({ classLabel: '6B', subjectId: 'maths', ratePercent: 59, status: 'class-gap', weakestConceptId: 'c_compare' });
  });
  it('suppresses cells with fewer than 3 attempts', () => {
    expect(out.gapCells.find((c) => c.classLabel === '5A')).toEqual({ classLabel: '5A', subjectId: 'hindi', ratePercent: null, status: 'not-enough-evidence' });
  });
  it('contains only aggregate fields: no student or teacher identifiers anywhere (threat model I2)', () => {
    const allowed = new Set(['activeTeachers', 'homeworkSet', 'submissionRate', 'gapCells', 'classLabel', 'subjectId', 'ratePercent', 'status', 'weakestConceptId', 'practiceSent', 'practiceCompleted', 'parentReportsOpened', 'headline']);
    const keys = new Set<string>();
    const walk = (v: unknown) => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') for (const [k, inner] of Object.entries(v)) { keys.add(k); walk(inner); }
    };
    walk(out);
    expect([...keys].filter((k) => !allowed.has(k))).toEqual([]);
  });
  it('has no headline when no class has a gap', () => {
    expect(schoolAggregates({ ...input, cells: [input.cells[1]!] }).headline).toBeNull();
  });
});
