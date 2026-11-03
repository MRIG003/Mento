'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { en, type I18nKey } from '@/i18n/en';
import { hi } from '@/i18n/hi';
import { readPrefs, subscribePrefs, writePrefs } from '../lib/prefs-store';
import { parseLang, resolveInitialLang, type LangSource } from './resolve-lang';
import { translate, type Lang, type Params } from './t';

const catalogues = { en, hi } as const;

/** Keys usable with t(): plain keys plus plural bases (`foo` for `foo_one` / `foo_other`). */
export type TKey = I18nKey | (I18nKey extends `${infer Base}_other` ? Base : never);

type LangState = { lang: Lang; source: LangSource };
type I18nValue = LangState & {
  /** false during prerender/hydration: render a skeleton for content, not wrong-language text (ADR-002). */
  ready: boolean;
  t: (key: TKey, params?: Params) => string;
  setLang: (lang: Lang) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

function linkLangFromHash(): Lang | null {
  const hash = window.location.hash.replace(/^#/, '');
  return hash ? parseLang(new URLSearchParams(hash).get('lang')) : null;
}

let cachedKey = '';
let cachedState: LangState = { lang: 'en', source: 'unknown' };
function readLangState(): LangState {
  const fromLink = linkLangFromHash();
  const stored = readPrefs().lang ?? null;
  const browser = window.navigator.languages ?? [window.navigator.language];
  const key = `${fromLink}|${stored}|${browser.join(',')}`;
  if (key !== cachedKey) {
    cachedKey = key;
    cachedState = resolveInitialLang({ fromLink, stored, browser });
  }
  return cachedState;
}

function subscribeLang(notify: () => void): () => void {
  const unsubscribe = subscribePrefs(notify);
  window.addEventListener('hashchange', notify);
  window.addEventListener('languagechange', notify);
  return () => {
    unsubscribe();
    window.removeEventListener('hashchange', notify);
    window.removeEventListener('languagechange', notify);
  };
}

const SERVER_STATE = null;

export function I18nProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribeLang, readLangState, () => SERVER_STATE);
  const ready = state !== null;
  const lang: Lang = state?.lang ?? 'en';
  const source: LangSource = state?.source ?? 'unknown';

  useEffect(() => {
    if (ready) document.documentElement.lang = lang;
  }, [lang, ready]);

  const setLang = useCallback((next: Lang) => {
    // A user's choice beats the link's preset from now on: drop `lang` from the fragment without navigating.
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    if (params.has('lang')) {
      params.delete('lang');
      const hash = params.toString();
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${hash ? `#${hash}` : ''}`);
    }
    writePrefs({ lang: next });
  }, []);

  const value = useMemo<I18nValue>(
    () => ({ lang, source, ready, setLang, t: (key, params) => translate(catalogues[lang], lang, key, params) }),
    [lang, source, ready, setLang],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>');
  return value;
}
