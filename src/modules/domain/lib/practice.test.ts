import { describe, expect, it } from 'vitest';
import type { Question } from '../entities';
import { QuestionSchema } from '../schemas';
import { seededRandom } from './token';
import { selectPractice } from './practice';

const make = (id: string, conceptId: string, difficulty: 1 | 2 | 3): Question =>
  QuestionSchema.parse({ id, conceptId, difficulty, type: 'fill', source: 'bank', prompt: { en: id }, answer: '1', acceptedVariants: [], numeric: true });

const bank = [
  make('e1', 'c_compare', 1), make('e2', 'c_compare', 1), make('e3', 'c_compare', 1),
  make('m1', 'c_compare', 2), make('m2', 'c_compare', 2), make('m3', 'c_compare', 2),
  make('h1', 'c_compare', 3), make('other', 'c_add', 1),
];

describe('selectPractice', () => {
  it('picks 3-5 unseen questions on the concept at difficulty 1-2, easiest first', () => {
    const r = selectPractice(bank, 'c_compare' as never, new Set(['e1']), seededRandom(1));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.length).toBe(5);
    expect(r.value).not.toContain('e1');
    expect(r.value).not.toContain('h1');
    expect(r.value).not.toContain('other');
    expect(r.value.slice(0, 2).every((id) => id.startsWith('e'))).toBe(true);
  });
  it('is deterministic for the same random seed', () => {
    const a = selectPractice(bank, 'c_compare' as never, new Set(), seededRandom(7));
    const b = selectPractice(bank, 'c_compare' as never, new Set(), seededRandom(7));
    expect(a).toEqual(b);
  });
  it('returns fewer than 5 when that is all there is, but never fewer than 3', () => {
    const r = selectPractice(bank, 'c_compare' as never, new Set(['e1', 'e2', 'e3']), seededRandom(1));
    expect(r.ok && r.value.length).toBe(3);
    const none = selectPractice(bank, 'c_compare' as never, new Set(['e1', 'e2', 'e3', 'm1']), seededRandom(1));
    expect(none).toEqual({ ok: false, error: { code: 'UNAVAILABLE', messageKey: 'practice.notEnoughQuestions' } });
  });
});
