import { describe, expect, it } from 'vitest';
import { emptyDraft, toQuestion } from './draft';

const id = 'q_own_1';

describe('toQuestion (editor draft → validated question)', () => {
  it('builds a bilingual MCQ, dropping empty options and keeping misconception notes', () => {
    const draft = { ...emptyDraft('mcq', 'c_frac_compare'), prompt: { en: 'Which is bigger: 2/7 or 5/7?', hi: '' },
      options: [{ text: { en: '5/7', hi: '' }, meaning: '' }, { text: { en: '2/7', hi: '' }, meaning: 'Thinks a smaller numerator is bigger' }, { text: { en: ' ', hi: '' }, meaning: '' }], correct: 0 };
    const r = toQuestion(draft, id);
    expect(r.ok).toBe(true);
    if (!r.ok || r.value.type !== 'mcq') return;
    expect(r.value.options).toHaveLength(2);
    expect(r.value.prompt).toEqual({ en: 'Which is bigger: 2/7 or 5/7?' });
    expect(r.value.options[1]?.misconception).toEqual({ en: 'Thinks a smaller numerator is bigger' });
    expect(r.value.source).toBe('teacher');
  });
  it.each([
    ['no prompt in either language', { prompt: { en: '', hi: ' ' } }, 'editor.err.prompt'],
    ['only one option', { options: [{ text: { en: 'a', hi: '' }, meaning: '' }] }, 'editor.err.options'],
    ['no right option marked', { correct: null }, 'editor.err.correct'],
    ['no concept', { conceptId: '' }, 'editor.err.concept'],
  ])('rejects an MCQ with %s', (_n, patch, key) => {
    const base = { ...emptyDraft('mcq', 'c_x'), prompt: { en: 'Q', hi: '' }, options: [{ text: { en: 'a', hi: '' }, meaning: '' }, { text: { en: 'b', hi: '' }, meaning: '' }], correct: 0 };
    expect(toQuestion({ ...base, ...patch } as never, id)).toMatchObject({ ok: false, error: { messageKey: key } });
  });
  it('builds a numeric fill-in with variants, trimming blanks', () => {
    const r = toQuestion({ ...emptyDraft('fill', 'c_x'), prompt: { en: '', hi: '1/2 को दशमलव में लिखें' }, answer: ' 0.5 ', variants: ['.5', ' ', 'आधा'], numeric: true }, id);
    expect(r.ok && r.value).toMatchObject({ type: 'fill', answer: '0.5', acceptedVariants: ['.5', 'आधा'], numeric: true, prompt: { hi: '1/2 को दशमलव में लिखें' } });
  });
  it('requires an answer for fill-in and key points for short answers', () => {
    expect(toQuestion({ ...emptyDraft('fill', 'c_x'), prompt: { en: 'Q', hi: '' } }, id)).toMatchObject({ ok: false, error: { messageKey: 'editor.err.answer' } });
    expect(toQuestion({ ...emptyDraft('short', 'c_x'), prompt: { en: 'Q', hi: '' } }, id)).toMatchObject({ ok: false, error: { messageKey: 'editor.err.keyPoints' } });
  });
  it('caps the minimum key points at the number given', () => {
    const r = toQuestion({ ...emptyDraft('short', 'c_x'), prompt: { en: 'Why?', hi: '' }, keyPoints: [{ en: 'same denominator', hi: '' }], minKeyPoints: 3 }, id);
    expect(r.ok && r.value.type === 'short' && r.value.minKeyPoints).toBe(1);
  });
  it('builds a photo question from just a prompt', () => {
    expect(toQuestion({ ...emptyDraft('photo', 'c_x'), prompt: { en: 'Show your working for 3/4 + 1/8', hi: '' } }, id).ok).toBe(true);
  });
  it('keeps markup-looking text as plain text (rendering escapes it)', () => {
    const r = toQuestion({ ...emptyDraft('photo', 'c_x'), prompt: { en: '<b>bold</b>', hi: '' } }, id);
    expect(r.ok && r.value.prompt.en).toBe('<b>bold</b>');
  });
});
