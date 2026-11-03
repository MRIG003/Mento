import type { Lang } from './t';

export function parseLang(value: unknown): Lang | null {
  return value === 'en' || value === 'hi' ? value : null;
}

export type LangSource = 'link' | 'device' | 'browser' | 'unknown';

/** ADR-002 order: language in the link → choice remembered on this device → browser language → English (unknown). */
export function resolveInitialLang(input: {
  fromLink: Lang | null;
  stored: Lang | null;
  browser: readonly string[];
}): { lang: Lang; source: LangSource } {
  if (input.fromLink) return { lang: input.fromLink, source: 'link' };
  if (input.stored) return { lang: input.stored, source: 'device' };
  for (const tag of input.browser) {
    const base = tag.toLowerCase().split('-')[0];
    if (base === 'hi') return { lang: 'hi', source: 'browser' };
    if (base === 'en') return { lang: 'en', source: 'browser' };
  }
  return { lang: 'en', source: 'unknown' };
}
