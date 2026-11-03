/** Compact builders for the demo question bank. Output is validated by QuestionSchema in seed.test.ts. */
type Bi = [en: string, hi: string];
const bi = ([en, hi]: Bi) => ({ en, hi });

export type RawQuestion = Record<string, unknown> & { id: string; conceptId: string; type: string };
type Opt = [id: string, text: Bi | string, misconception?: Bi];

export function mcq(id: string, conceptId: string, difficulty: 1 | 2 | 3, prompt: Bi, options: Opt[], correct: string): RawQuestion {
  return {
    id, conceptId, type: 'mcq', difficulty, source: 'bank', prompt: bi(prompt), correctOptionId: correct,
    options: options.map(([oid, text, misc]) => ({
      id: oid,
      text: typeof text === 'string' ? { en: text, hi: text } : bi(text),
      ...(misc ? { misconception: bi(misc) } : {}),
    })),
  };
}

export function fill(id: string, conceptId: string, difficulty: 1 | 2 | 3, prompt: Bi, answer: string, variants: string[] = [], numeric = false): RawQuestion {
  return { id, conceptId, type: 'fill', difficulty, source: 'bank', prompt: bi(prompt), answer, acceptedVariants: variants, numeric };
}

export function short(id: string, conceptId: string, difficulty: 1 | 2 | 3, prompt: Bi, keyPoints: [Bi, string[]][], minKeyPoints: number): RawQuestion {
  return { id, conceptId, type: 'short', difficulty, source: 'bank', prompt: bi(prompt), minKeyPoints, keyPoints: keyPoints.map(([text, variants]) => ({ text: bi(text), variants })) };
}

/** A typical wrong typed answer per fill question, used to generate realistic demo submissions. */
export const WRONG_TYPED: Record<string, string> = {};
export function wrongTyped(id: string, value: string) { WRONG_TYPED[id] = value; }
