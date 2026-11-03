import { describe, expect, it } from 'vitest';
import { classConceptStatus, reportBand, studentConceptStatus } from './gap-rules';

describe('studentConceptStatus: flag only with ≥ 2 attempts and fewer than half right', () => {
  it.each([
    ['0 attempts', 0, 0, 'not-enough-evidence'],
    ['1 attempt, wrong: one wrong answer is not a gap', 1, 0, 'not-enough-evidence'],
    ['2 attempts, both wrong', 2, 0, 'stuck'],
    ['2 attempts, 1 right (exactly 50%)', 2, 1, 'on-track'],
    ['3 attempts, 1 right (33%)', 3, 1, 'stuck'],
    ['100 attempts, 49 right (49%)', 100, 49, 'stuck'],
    ['100 attempts, 50 right (50%)', 100, 50, 'on-track'],
    ['4 attempts, all right', 4, 4, 'on-track'],
  ] as const)('%s → %s', (_name, attempted, correct, kind) => {
    expect(studentConceptStatus({ attempted, correct })).toEqual({ kind, attempted, correct });
  });
});

describe('classConceptStatus: flag when < 60% right across ≥ 3 attempts', () => {
  it.each([
    ['2 attempts, none right', 2, 0, 'not-enough-evidence'],
    ['3 attempts, none right', 3, 0, 'class-gap'],
    ['100 attempts, 59 right (59%)', 100, 59, 'class-gap'],
    ['100 attempts, 60 right (60%)', 100, 60, 'ok'],
    ['5 attempts, 3 right (60%)', 5, 3, 'ok'],
    ['32 attempts, 13 right (41%)', 32, 13, 'class-gap'],
  ] as const)('%s → %s', (_name, attempted, correct, kind) => {
    expect(classConceptStatus({ attempted, correct })).toEqual({ kind, attempted, correct });
  });
});

describe('reportBand (parent report)', () => {
  it.each([
    [1, 1, 'not-enough-evidence'],
    [2, 0, 'not-yet'],
    [4, 2, 'getting-there'],
    [5, 3, 'getting-there'],
    [5, 4, 'understood'],
    [10, 7, 'getting-there'],
    [10, 8, 'understood'],
  ] as const)('%i attempts, %i right → %s', (attempted, correct, band) => {
    expect(reportBand({ attempted, correct })).toBe(band);
  });
});
