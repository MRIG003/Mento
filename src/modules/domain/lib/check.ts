import type { I18nKey } from '@/i18n/en';
import type { Answer, Question, Verdict } from '../entities';
import { normaliseAnswer, parseNumber, tokens } from './normalise';

/** Reasons are i18n keys; Extract<> makes a missing catalogue entry a compile error. */
export type CheckReason = Extract<I18nKey, 'check.reason.someKeyPoints' | 'check.reason.noKeyPoints' | 'check.reason.photo'>;
export type CheckOutcome = { verdict: Verdict; reasonKey?: CheckReason };

const unanswered: CheckOutcome = { verdict: 'unanswered' };

/** Auto-check one answer (SPEC-domain). Uncertain cases return `unsure` for the teacher; nothing is forced. */
export function checkAnswer(question: Question, answer: Answer | undefined): CheckOutcome {
  if (!answer) return unanswered;
  switch (question.type) {
    case 'mcq':
      if (answer.type !== 'mcq' || !answer.optionId) return unanswered;
      return { verdict: answer.optionId === question.correctOptionId ? 'correct' : 'incorrect' };

    case 'fill': {
      if (answer.type !== 'fill') return unanswered;
      const typed = normaliseAnswer(answer.text, { loose: true });
      if (!typed) return unanswered;
      const keys = [question.answer, ...question.acceptedVariants].map((k) => normaliseAnswer(k, { loose: true }));
      if (keys.includes(typed)) return { verdict: 'correct' };
      if (question.numeric) {
        const value = parseNumber(typed);
        if (value !== null && keys.some((k) => parseNumber(k) === value)) return { verdict: 'correct' };
      }
      return { verdict: 'incorrect' };
    }

    case 'short': {
      if (answer.type !== 'short') return unanswered;
      const words = tokens(normaliseAnswer(answer.text, { loose: true }));
      if (words.length === 0) return unanswered;
      const found = question.keyPoints.filter((point) =>
        [point.text.en, point.text.hi, ...point.variants]
          .filter((k): k is string => Boolean(k))
          .some((k) => containsSequence(words, tokens(normaliseAnswer(k, { loose: true })))),
      ).length;
      if (found >= question.minKeyPoints) return { verdict: 'correct' };
      return { verdict: 'unsure', reasonKey: found > 0 ? 'check.reason.someKeyPoints' : 'check.reason.noKeyPoints' };
    }

    case 'photo':
      if (answer.type !== 'photo' || !answer.photoRef) return unanswered;
      return { verdict: 'unsure', reasonKey: 'check.reason.photo' };

    default: {
      const exhaustive: never = question;
      return exhaustive;
    }
  }
}

function containsSequence(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0) return false;
  for (let i = 0; i + needle.length <= haystack.length; i += 1) {
    if (needle.every((word, j) => haystack[i + j] === word)) return true;
  }
  return false;
}
