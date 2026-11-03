import { describe, expect, it } from 'vitest';
import { detectMisconceptions, mostMissedQuestion } from './misconceptions';
import { mcq, submission } from './test.fixtures';

const q1 = mcq('q1', 'c_compare', { misconceptionOn: 'b' });
const q2 = mcq('q2', 'c_compare');

describe('detectMisconceptions', () => {
  it('reports a tagged distractor chosen by at least 2 children, as evidence ("3 of 4")', () => {
    const subs = [
      submission('s1', [{ q: 'q1', option: 'b' }]), submission('s2', [{ q: 'q1', option: 'b' }]),
      submission('s3', [{ q: 'q1', option: 'b' }]), submission('s4', [{ q: 'q1', option: 'a' }]),
    ];
    expect(detectMisconceptions([q1, q2], subs)).toEqual([{ questionId: 'q1', optionId: 'b', count: 3, of: 4 }]);
  });
  it('stays silent when only one child chose it', () => {
    const subs = [submission('s1', [{ q: 'q1', option: 'b' }]), submission('s2', [{ q: 'q1', option: 'a' }])];
    expect(detectMisconceptions([q1], subs)).toEqual([]);
  });
  it('ignores distractors without a misconception label', () => {
    const subs = [submission('s1', [{ q: 'q2', option: 'c' }]), submission('s2', [{ q: 'q2', option: 'c' }])];
    expect(detectMisconceptions([q2], subs)).toEqual([]);
  });
  it('does not count a pick the teacher marked correct', () => {
    const subs = [submission('s1', [{ q: 'q1', option: 'b', override: 'correct' }]), submission('s2', [{ q: 'q1', option: 'b' }])];
    expect(detectMisconceptions([q1], subs)).toEqual([]);
  });
});

describe('mostMissedQuestion', () => {
  it('picks the lowest correct rate, earlier question on a tie', () => {
    const subs = [
      submission('s1', [{ q: 'q1', option: 'b' }, { q: 'q2', option: 'b' }]),
      submission('s2', [{ q: 'q1', option: 'a' }, { q: 'q2', option: 'b' }]),
    ];
    expect(mostMissedQuestion([q1, q2], subs)).toEqual({ questionId: 'q2', wrong: 2, attempted: 2 });
    const tie = [submission('s1', [{ q: 'q1', option: 'b' }, { q: 'q2', option: 'b' }])];
    expect(mostMissedQuestion([q1, q2], tie)?.questionId).toBe('q1');
  });
  it('is null when nothing was attempted', () => expect(mostMissedQuestion([q1], [])).toBeNull());
});
