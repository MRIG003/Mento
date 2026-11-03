import { en } from '@/i18n/en';
import { hi } from '@/i18n/hi';
import type { TKey } from './provider';
import { translate, type Lang, type Params } from './t';

/** Translate into a specific language, independent of the UI language (e.g. a WhatsApp message in the class language). */
export function translateIn(lang: Lang, key: TKey, params?: Params): string {
  return translate(lang === 'hi' ? hi : en, lang, key, params);
}
