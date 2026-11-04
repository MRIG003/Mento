/**
 * Demo submissions (Demo data). 6B Fractions uses explicit per-child profiles so the story is stable; the gap rules
 * then compute who is stuck (nothing here says "stuck"). 6A and 5A use seeded randomness.
 */
import { checkAnswer, QuestionSchema, type Answer, type Question, type RandomSource } from '@/modules/domain';
import { WRONG_TYPED, type RawQuestion } from './q';

export const HW_6B_QUESTIONS = ['q_fa1', 'q_fa2', 'q_fa4', 'q_fe1', 'q_fe2', 'q_fc1', 'q_fc2', 'q_fc4'] as const;
export const HW_6A_QUESTIONS = ['q_dp1', 'q_dp2', 'q_dc1', 'q_dc2', 'q_da1', 'q_da2'] as const;
export const HW_7A_QUESTIONS = ['q_s7h1', 'q_s7h2', 'q_s7h3', 'q_s7h6', 'q_s7a1', 'q_s7a2', 'q_s7a3', 'q_s7a5'] as const;
export const HW_5A_QUESTIONS = ['q_hs1', 'q_hs2', 'q_hp1', 'q_hp2', 'q_hv1', 'q_hv2'] as const;

const SHORT_FULL = [
  'Add the numerators and keep the same denominator, so 3/5.',
  'अंशों को जोड़ते हैं और हर वही रहता है',
  'add the top numbers, the denominator stays the same',
];
const SHORT_PARTIAL = ['Add the top numbers.', 'हर समान है'];
const SHORT_NONE = ['3/10', 'I am not sure'];

type Profile = { add: { fa1: boolean; fa2: boolean; short: 'full' | 'partial' | 'none' }; equivCorrect: 0 | 1 | 2; compareCorrect: 0 | 1 | 2 | 3 };

/** 32 of 40 children submitted. Index = roster position. */
export function profiles6B(): Profile[] {
  const compare: Profile['compareCorrect'][] = [0, 1, 1, 0, 1, 1, 3, ...Array<2>(25).fill(2)];
  const equivZero = new Set([10, 15, 20, 25]);
  const equivTwo = new Set([6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21]);
  const fa1Wrong = new Set([3, 8, 12, 17, 22]);
  const fa2Wrong = new Set([3, 9, 12, 18, 27]);
  return compare.map((compareCorrect, i) => ({
    compareCorrect,
    equivCorrect: equivZero.has(i) ? 0 : equivTwo.has(i) ? 2 : 1,
    add: { fa1: !fa1Wrong.has(i), fa2: !fa2Wrong.has(i), short: i % 8 <= 4 ? 'full' : i % 8 <= 6 ? 'partial' : 'none' },
  }));
}

function wrongOption(q: Question & { type: 'mcq' }, preferMisconception: boolean): string {
  const wrong = q.options.filter((o) => o.id !== q.correctOptionId);
  const tagged = wrong.find((o) => o.misconception);
  return (preferMisconception && tagged ? tagged : wrong[wrong.length - 1] ?? wrong[0])?.id ?? 'b';
}

export function answerFor(q: Question, correct: boolean, opts: { preferMisconception?: boolean; shortKind?: 'full' | 'partial' | 'none'; variantIndex?: number } = {}): Answer {
  const v = opts.variantIndex ?? 0;
  switch (q.type) {
    case 'mcq': return { type: 'mcq', optionId: correct ? q.correctOptionId : wrongOption(q, opts.preferMisconception ?? true) };
    case 'fill': return { type: 'fill', text: correct ? ([q.answer, ...q.acceptedVariants][v % (1 + q.acceptedVariants.length)] ?? q.answer) : WRONG_TYPED[q.id] ?? '?' };
    case 'short': {
      const pool = opts.shortKind === 'partial' ? SHORT_PARTIAL : opts.shortKind === 'none' ? SHORT_NONE : SHORT_FULL;
      return { type: 'short', text: pool[v % pool.length] ?? '' };
    }
    case 'photo': return { type: 'photo', photoRef: 'none', qualityScore: 0 };
  }
}

export function evaluate(questions: ReadonlyMap<string, Question>, answers: Record<string, Answer>) {
  return Object.entries(answers).map(([questionId, answer]) => {
    const question = questions.get(questionId);
    const outcome = question ? checkAnswer(question, answer) : { verdict: 'unanswered' as const };
    return { questionId, verdict: outcome.verdict, by: 'auto' as const, ...(outcome.reasonKey ? { reasonKey: outcome.reasonKey } : {}) };
  });
}

/** Answers for one 6B child from their profile (which compare questions they miss rotates by position). */
export function answers6B(p: Profile, index: number, questions: ReadonlyMap<string, Question>): Record<string, Answer> {
  const q = (id: string) => questions.get(id) as Question;
  const compareIds = ['q_fc1', 'q_fc2', 'q_fc4'];
  // Who is stuck misses the "bigger denominator" questions first (fc2, fc4); others usually miss fc1 or fc4.
  const missOrder = p.compareCorrect <= 1 ? ['q_fc2', 'q_fc4', 'q_fc1'] : index % 3 === 0 ? ['q_fc4', 'q_fc1', 'q_fc2'] : index % 3 === 1 ? ['q_fc1', 'q_fc4', 'q_fc2'] : ['q_fc2', 'q_fc1', 'q_fc4'];
  const missed = new Set(missOrder.slice(0, 3 - p.compareCorrect));
  const out: Record<string, Answer> = {
    q_fa1: answerFor(q('q_fa1'), p.add.fa1),
    q_fa2: answerFor(q('q_fa2'), p.add.fa2, { variantIndex: index }),
    q_fa4: answerFor(q('q_fa4'), true, { shortKind: p.add.short, variantIndex: index }),
    q_fe1: answerFor(q('q_fe1'), p.equivCorrect >= 1),
    q_fe2: answerFor(q('q_fe2'), p.equivCorrect >= 2, { variantIndex: index }),
  };
  for (const id of compareIds) out[id] = answerFor(q(id), !missed.has(id), { preferMisconception: p.compareCorrect <= 1 || index % 4 === 0 });
  return out;
}

/** Random answers with a success probability, for classes that only need realistic aggregates. */
export function randomAnswers(ids: readonly string[], questions: ReadonlyMap<string, Question>, pCorrect: number, rng: RandomSource): Record<string, Answer> {
  const out: Record<string, Answer> = {};
  const bytes = rng.bytes(ids.length * 2);
  ids.forEach((id, i) => {
    const q = questions.get(id);
    if (!q) return;
    const roll = (bytes[2 * i] ?? 0) / 256;
    out[id] = answerFor(q, roll < pCorrect, { preferMisconception: (bytes[2 * i + 1] ?? 0) < 160, variantIndex: bytes[2 * i + 1] ?? 0 });
  });
  return out;
}

export function parseBank(raw: readonly RawQuestion[]): Map<string, Question> {
  return new Map(raw.map((r) => { const q = QuestionSchema.parse(r); return [q.id, q] as const; }));
}

/**
 * 7A Science, Heat and acids: 30 children. Heat is mostly fine; Acids and bases is the class gap. Who is stuck is decided by the
 * gap rules from these answers (nothing here says "stuck"). Index = roster position; how many acid questions each child gets right:
 * 4 children 0, 3 children 1, 10 children 2, 7 children 3, 6 children 4. Two children also struggle with Heat.
 */
export function answers7A(index: number, questions: ReadonlyMap<string, Question>): Record<string, Answer> {
  const q = (id: string) => questions.get(id) as Question;
  const acidRight = index < 4 ? 0 : index < 7 ? 1 : index < 17 ? 2 : index < 24 ? 3 : 4;
  const heatRight = index === 5 || index === 11 ? 1 : index % 5 === 0 ? 3 : 4;
  const heatIds = ['q_s7h1', 'q_s7h2', 'q_s7h3', 'q_s7h6'];
  const acidIds = ['q_s7a1', 'q_s7a2', 'q_s7a3', 'q_s7a5'];
  const out: Record<string, Answer> = {};
  // Which questions a child misses rotates with position so the mistakes are spread, not identical.
  const rotate = (ids: string[], by: number) => [...ids.slice(by % ids.length), ...ids.slice(0, by % ids.length)];
  const missedHeat = new Set(rotate(heatIds, index).slice(0, 4 - heatRight));
  const missedAcid = new Set(rotate(acidIds, index + 1).slice(0, 4 - acidRight));
  for (const id of heatIds) out[id] = answerFor(q(id), !missedHeat.has(id), { preferMisconception: index % 2 === 0 });
  for (const id of acidIds) out[id] = answerFor(q(id), !missedAcid.has(id), { preferMisconception: acidRight <= 1 || index % 3 === 0 });
  return out;
}
