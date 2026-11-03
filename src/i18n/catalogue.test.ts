import { describe, expect, it } from 'vitest';
import { en } from './en';
import { hi } from './hi';

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
/** Strings that are legitimately identical in both languages. */
const SAME_IN_BOTH = new Set(['common.appName', 'common.whatsapp', 'lang.en', 'lang.hi', 'lang.switchEn', 'lang.switchHi']);

describe('i18n catalogues', () => {
  it('have exactly the same keys in English and Hindi', () => {
    expect(Object.keys(hi).sort()).toEqual(Object.keys(en).sort());
  });
  it.each(Object.keys(en))('"%s" uses the same placeholders in both languages', (key) => {
    const k = key as keyof typeof en;
    expect(placeholders(hi[k])).toEqual(placeholders(en[k]));
  });
  it.each(Object.keys(en))('"%s" is not empty and is translated', (key) => {
    const k = key as keyof typeof en;
    expect(en[k].trim()).not.toBe('');
    expect(hi[k].trim()).not.toBe('');
    if (!SAME_IN_BOTH.has(key)) expect(hi[k]).not.toBe(en[k]);
  });
});
