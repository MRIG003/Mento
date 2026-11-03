import { describe, expect, it } from 'vitest';
import { parseLang, resolveInitialLang } from './resolve-lang';

describe('parseLang', () => {
  it('accepts only en and hi', () => {
    expect(parseLang('hi')).toBe('hi');
    expect(parseLang('en')).toBe('en');
    expect(parseLang('<script>')).toBeNull();
    expect(parseLang(undefined)).toBeNull();
  });
});

describe('resolveInitialLang', () => {
  it('prefers the language carried by the link', () => {
    expect(resolveInitialLang({ fromLink: 'hi', stored: 'en', browser: ['en-IN'] })).toEqual({ lang: 'hi', source: 'link' });
  });
  it('then the choice remembered on this device', () => {
    expect(resolveInitialLang({ fromLink: null, stored: 'hi', browser: ['en-US'] })).toEqual({ lang: 'hi', source: 'device' });
  });
  it('then the browser language, treating any hi-* as Hindi', () => {
    expect(resolveInitialLang({ fromLink: null, stored: null, browser: ['hi-IN', 'en'] })).toEqual({ lang: 'hi', source: 'browser' });
    expect(resolveInitialLang({ fromLink: null, stored: null, browser: ['en-IN'] })).toEqual({ lang: 'en', source: 'browser' });
  });
  it('reports "unknown" when nothing tells us, so the link can offer the two big buttons', () => {
    expect(resolveInitialLang({ fromLink: null, stored: null, browser: ['ta-IN'] })).toEqual({ lang: 'en', source: 'unknown' });
    expect(resolveInitialLang({ fromLink: null, stored: null, browser: [] })).toEqual({ lang: 'en', source: 'unknown' });
  });
});
