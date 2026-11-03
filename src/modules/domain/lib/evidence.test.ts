import { describe, expect, it } from 'vitest';
import type { Question } from '../entities';
import { classEvidence, finalVerdicts, studentEvidence } from './evidence';
import { mcq, scored, submission } from './test.fixtures';

const questions = new Map<string, Question>(
  ['q1', 'q2', 'q3', 'q4'].map((id) => [id, mcq(id, 'c_compare')] as const),
);

describe('finalVerdicts', () => {
  it('lets the teacher override the auto-check', () => {
    const sub = submission('s1', [{ q: 'q1', option: 'b', override: 'correct' }]);
    expect(finalVerdicts(sub).get('q1' as never)).toBe('correct');
  });
  it('never treats a simulated reader suggestion as final', () => {
    const sub = submission('s1', [{ q: 'q1', verdict: 'unsure' }]);
    sub.evaluations.push({ questionId: 'q1' as never, verdict: 'correct', by: 'reader-preview' });
    expect(finalVerdicts(sub).get('q1' as never)).toBe('unsure');
  });
});

describe('studentEvidence', () => {
  it('counts only right and wrong answers as attempts (unsure and blanks do not count)', () => {
    const sub = submission('s1', [{ q: 'q1', option: 'a' }, { q: 'q2', option: 'b' }, { q: 'q3', verdict: 'unsure' }]);
    expect(studentEvidence([sub], questions).get('s1' as never)?.get('c_compare' as never)).toEqual({ attempted: 2, correct: 1 });
  });
  it('ignores drafts that were never submitted', () => {
    const draft = submission('s1', [{ q: 'q1', option: 'b' }, { q: 'q2', option: 'b' }], { status: 'draft' });
    expect(studentEvidence([draft], questions).size).toBe(0);
  });
  it('reflects a teacher override in the counts', () => {
    const sub = submission('s1', [{ q: 'q1', option: 'b', override: 'correct' }, { q: 'q2', option: 'b' }]);
    expect(studentEvidence([sub], questions).get('s1' as never)?.get('c_compare' as never)).toEqual({ attempted: 2, correct: 1 });
  });
});

describe('classEvidence', () => {
  it('adds up every student’s attempts on a concept', () => {
    const subs = [scored('s1', 1, 2), scored('s2', 3, 0), scored('s3', 0, 1)];
    expect(classEvidence(subs, questions).get('c_compare' as never)).toEqual({ attempted: 7, correct: 4 });
  });
});
