import type { Counts } from './gap-rules';

const formatters: Partial<Record<'en' | 'hi', Intl.NumberFormat>> = {};

/** Indian grouping (1,20,000). Western digits in both languages for clarity (to confirm in native review). */
export function formatIndianNumber(n: number, lang: 'en' | 'hi'): string {
  const f = (formatters[lang] ??= new Intl.NumberFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { numberingSystem: 'latn', maximumFractionDigits: 1 }));
  return f.format(n);
}

/** Whole-number % right, or null when there is nothing to measure. */
export function ratePercent({ attempted, correct }: Counts): number | null {
  return attempted === 0 ? null : Math.round((100 * correct) / attempted);
}
