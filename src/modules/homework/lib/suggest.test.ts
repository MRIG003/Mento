import { describe, expect, it } from 'vitest';
import { QuestionSchema, type Question } from '@/modules/domain';
import { defaultDue, suggestQuestions } from './suggest';

const q = (id: string, conceptId: string, difficulty: 1 | 2 | 3): Question =>
  QuestionSchema.parse({ id, conceptId, difficulty, type: 'fill', source: 'bank', prompt: { en: id }, answer: '1', acceptedVariants: [], numeric: true });

const bank = [
  q('a1', 'add', 1), q('a2', 'add', 2), q('a3', 'add', 3), q('a4', 'add', 1),
  q('e1', 'equiv', 2), q('e2', 'equiv', 1), q('e3', 'equiv', 1),
  q('c1', 'compare', 1), q('c2', 'compare', 1), q('c3', 'compare', 2),
];

describe('suggestQuestions', () => {
  it('picks 5 easy-first questions spread so every concept gets at least 2 where possible', () => {
    const picked = suggestQuestions(bank, ['add', 'equiv', 'compare'], 5);
    expect(picked).toHaveLength(5);
    const per = (c: string) => picked.filter((id) => id.startsWith(c[0]!)).length;
    expect([per('add'), per('equiv'), per('compare')].sort()).toEqual([1, 2, 2]);
    expect(picked).not.toContain('a3');
  });
  it('gives two concepts 2-3 each, and never repeats a question', () => {
    const picked = suggestQuestions(bank, ['add', 'compare'], 5);
    expect(new Set(picked).size).toBe(5);
    expect(picked.filter((id) => id.startsWith('a')).length).toBeGreaterThanOrEqual(2);
  });
  it('returns fewer when the chapter is small', () => expect(suggestQuestions(bank, ['compare'], 5)).toEqual(['c1', 'c2', 'c3']));
});

describe('defaultDue', () => {
  it('is tomorrow at 20:00 on this device by default', () => {
    const due = defaultDue(new Date(2026, 10, 3, 9, 15));
    expect([due.getDate(), due.getHours(), due.getMinutes()]).toEqual([4, 20, 0]);
  });
  it('reuses the time of day from the last homework', () => {
    const due = defaultDue(new Date(2026, 10, 3, 9, 15), new Date(2026, 9, 20, 18, 30).toISOString());
    expect([due.getDate(), due.getHours(), due.getMinutes()]).toEqual([4, 18, 30]);
  });
});
