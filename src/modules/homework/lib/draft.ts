import { QuestionSchema, err, ok, type Bilingual, type Question, type Result } from '@/modules/domain';

type BiText = { en: string; hi: string };
export type QuestionDraft = {
  type: Question['type'];
  conceptId: string;
  prompt: BiText;
  options: { text: BiText; meaning: string }[];
  correct: number | null;
  answer: string;
  variants: string[];
  numeric: boolean;
  keyPoints: BiText[];
  minKeyPoints: number;
};

export function emptyDraft(type: Question['type'], conceptId: string): QuestionDraft {
  const blank = { en: '', hi: '' };
  return { type, conceptId, prompt: { ...blank }, options: [{ text: { ...blank }, meaning: '' }, { text: { ...blank }, meaning: '' }], correct: null, answer: '', variants: [], numeric: false, keyPoints: [{ ...blank }], minKeyPoints: 1 };
}

/** Keep only languages with visible text. */
function bi(t: BiText): Bilingual | null {
  const out: Bilingual = {};
  if (t.en.trim()) out.en = t.en.trim();
  if (t.hi.trim()) out.hi = t.hi.trim();
  return out.en || out.hi ? out : null;
}

/** Editor draft → validated Question (plain text only; threat model T2), or the first problem as an i18n key. */
export function toQuestion(draft: QuestionDraft, id: string): Result<Question> {
  if (!draft.conceptId) return err('VALIDATION', 'editor.err.concept');
  const prompt = bi(draft.prompt);
  if (!prompt) return err('VALIDATION', 'editor.err.prompt');
  const base = { id, conceptId: draft.conceptId, prompt, difficulty: 2 as const, source: 'teacher' as const };
  let raw: unknown;
  switch (draft.type) {
    case 'mcq': {
      const kept = draft.options.map((o, i) => ({ i, text: bi(o.text), meaning: o.meaning.trim() })).filter((o) => o.text);
      if (kept.length < 2) return err('VALIDATION', 'editor.err.options');
      const correct = kept.find((o) => o.i === draft.correct);
      if (!correct) return err('VALIDATION', 'editor.err.correct');
      const options = kept.map((o, n) => ({ id: String.fromCharCode(97 + n), text: o.text, ...(o.meaning ? { misconception: { en: o.meaning } } : {}) }));
      raw = { ...base, type: 'mcq', options, correctOptionId: String.fromCharCode(97 + kept.indexOf(correct)) };
      break;
    }
    case 'fill': {
      if (!draft.answer.trim()) return err('VALIDATION', 'editor.err.answer');
      raw = { ...base, type: 'fill', answer: draft.answer.trim(), acceptedVariants: draft.variants.map((v) => v.trim()).filter(Boolean).slice(0, 10), numeric: draft.numeric };
      break;
    }
    case 'short': {
      const points = draft.keyPoints.map(bi).filter((p): p is Bilingual => p !== null).slice(0, 4);
      if (points.length === 0) return err('VALIDATION', 'editor.err.keyPoints');
      raw = { ...base, type: 'short', keyPoints: points.map((text) => ({ text, variants: [] })), minKeyPoints: Math.min(Math.max(1, draft.minKeyPoints), points.length) };
      break;
    }
    case 'photo':
      raw = { ...base, type: 'photo' };
      break;
  }
  const parsed = QuestionSchema.safeParse(raw);
  return parsed.success ? ok(parsed.data) : err('VALIDATION', 'error.validation', parsed.error.issues.slice(0, 3));
}
