'use client';

import { useI18n } from '../i18n/provider';
import type { Lang } from '../i18n/t';

const OPTIONS: { lang: Lang; label: 'lang.switchEn' | 'lang.switchHi'; name: 'lang.en' | 'lang.hi' }[] = [
  { lang: 'en', label: 'lang.switchEn', name: 'lang.en' },
  { lang: 'hi', label: 'lang.switchHi', name: 'lang.hi' },
];

/** `EN | हिं`: one tap, re-renders in place (no navigation), so typed answers and scroll survive (SPEC-foundation). */
export function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div role="group" aria-label={t('lang.label')} className="flex shrink-0 items-center rounded-full border border-line bg-card p-0.5 shadow-card">
      {OPTIONS.map((option) => {
        const active = option.lang === lang;
        return (
          <button
            key={option.lang}
            type="button"
            lang={option.lang}
            aria-pressed={active}
            aria-label={t('lang.switchTo', { language: t(option.name) })}
            onClick={() => { if (!active) setLang(option.lang); }}
            className={`min-h-tap min-w-tap rounded-full px-3 text-base font-bold transition-colors ${
              active ? 'bg-primary text-card' : 'text-ink hover:bg-paper'
            } ${option.lang === 'hi' ? 'font-deva' : ''}`}
          >
            {t(option.label)}
          </button>
        );
      })}
    </div>
  );
}
