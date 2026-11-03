import { describe, expect, it } from 'vitest';
import type { Question } from '../entities';
import { QuestionSchema } from '../schemas';
import { checkAnswer } from './check';

const q = (raw: unknown): Question => QuestionSchema.parse(raw);
const base = { id: 'q_1', conceptId: 'c_1', difficulty: 1, source: 'bank', prompt: { en: 'p' } };

const mcq = q({ ...base, type: 'mcq', options: [{ id: 'a', text: { en: '3/5' } }, { id: 'b', text: { en: '2/5' } }], correctOptionId: 'a' });
const fillNumber = q({ ...base, type: 'fill', answer: '0.5', acceptedVariants: ['1/2', 'half', 'आधा'], numeric: true });
const fillWord = q({ ...base, type: 'fill', answer: 'संज्ञा', acceptedVariants: ['sangya'], numeric: false });
const short = q({
  ...base, type: 'short', minKeyPoints: 2,
  keyPoints: [
    { text: { en: 'same denominator', hi: 'हर समान' }, variants: ['same bottom number'] },
    { text: { en: 'bigger numerator', hi: 'अंश बड़ा' }, variants: ['larger numerator'] },
  ],
});
const photo = q({ ...base, type: 'photo' });

describe('checkAnswer: MCQ', () => {
  it('is correct for the keyed option', () => expect(checkAnswer(mcq, { type: 'mcq', optionId: 'a' }).verdict).toBe('correct'));
  it('is incorrect for another option', () => expect(checkAnswer(mcq, { type: 'mcq', optionId: 'b' }).verdict).toBe('incorrect'));
  it('is unanswered when nothing was picked', () => expect(checkAnswer(mcq, undefined).verdict).toBe('unanswered'));
  it('treats an answer of the wrong shape as unanswered, never as correct', () => {
    expect(checkAnswer(mcq, { type: 'fill', text: 'a' }).verdict).toBe('unanswered');
  });
});

describe('checkAnswer: number / fill-in', () => {
  it.each(['0.5', '.5', '०.५', ' 0.50 ', '1/2', '1 / 2', 'HALF', 'आधा।'])('accepts %s for 0.5', (text) => {
    expect(checkAnswer(fillNumber, { type: 'fill', text }).verdict).toBe('correct');
  });
  it.each(['0.6', '2/4', '5'])('rejects %s (fractions are compared as typed unless listed)', (text) => {
    expect(checkAnswer(fillNumber, { type: 'fill', text }).verdict).toBe('incorrect');
  });
  it('is unanswered for blank or whitespace-only text', () => {
    expect(checkAnswer(fillNumber, { type: 'fill', text: '  ​ ' }).verdict).toBe('unanswered');
  });
  it('matches Hindi words with zero-width noise and trailing danda', () => {
    expect(checkAnswer(fillWord, { type: 'fill', text: 'सं‍ज्ञा।' }).verdict).toBe('correct');
    expect(checkAnswer(fillWord, { type: 'fill', text: 'Sangya' }).verdict).toBe('correct');
    expect(checkAnswer(fillWord, { type: 'fill', text: 'सर्वनाम' }).verdict).toBe('incorrect');
  });
  it('accepts common Hindi spelling variants (nukta, chandrabindu)', () => {
    const hasna = q({ ...base, type: 'fill', answer: 'हँसना', acceptedVariants: [], numeric: false });
    expect(checkAnswer(hasna, { type: 'fill', text: 'हंसना' }).verdict).toBe('correct');
  });
});

describe('checkAnswer: short typed answer (never forced to incorrect)', () => {
  it('is correct when enough key points appear, in either language', () => {
    expect(checkAnswer(short, { type: 'short', text: 'They have the same denominator, so the bigger numerator wins.' }).verdict).toBe('correct');
    expect(checkAnswer(short, { type: 'short', text: 'हर समान है इसलिए जिसका अंश बड़ा वह बड़ा' }).verdict).toBe('correct');
  });
  it('accepts listed variants', () => {
    expect(checkAnswer(short, { type: 'short', text: 'same bottom number and larger numerator' }).verdict).toBe('correct');
  });
  it('sends partial matches to the teacher as unsure, with a reason', () => {
    const out = checkAnswer(short, { type: 'short', text: 'same denominator' });
    expect(out).toEqual({ verdict: 'unsure', reasonKey: 'check.reason.someKeyPoints' });
  });
  it('sends answers with no key points to the teacher as unsure, not incorrect', () => {
    expect(checkAnswer(short, { type: 'short', text: 'I think 3/5' })).toEqual({ verdict: 'unsure', reasonKey: 'check.reason.noKeyPoints' });
  });
  it('matches whole words only ("numerator." matches, "enumerator" does not)', () => {
    const oneKey = q({ ...base, type: 'short', minKeyPoints: 1, keyPoints: [{ text: { en: 'numerator' }, variants: [] }] });
    expect(checkAnswer(oneKey, { type: 'short', text: 'the numerator.' }).verdict).toBe('correct');
    expect(checkAnswer(oneKey, { type: 'short', text: 'enumerator' }).verdict).toBe('unsure');
  });
});

describe('checkAnswer: photo', () => {
  it('always goes to the teacher (AI reading is Preview and never final)', () => {
    expect(checkAnswer(photo, { type: 'photo', photoRef: 'blob_1', qualityScore: 0.9 })).toEqual({ verdict: 'unsure', reasonKey: 'check.reason.photo' });
  });
  it('is unanswered when no photo was sent', () => expect(checkAnswer(photo, undefined).verdict).toBe('unanswered'));
});
