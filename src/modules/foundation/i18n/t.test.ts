import { describe, expect, it } from 'vitest';
import { format, translate } from './t';

const en = { greet: 'Hello {name}', 'kids_one': '{count} child', 'kids_other': '{count} children', plain: 'Plain' } as const;
const hi = { greet: 'नमस्ते {name}', 'kids_one': '{count} बच्चा', 'kids_other': '{count} बच्चे', plain: 'सादा' } as const;

describe('format', () => {
  it('replaces named placeholders', () => expect(format('Hi {a} and {b}', { a: 'X', b: 2 })).toBe('Hi X and 2'));
  it('leaves unknown placeholders visible so a bug shows instead of hiding', () => expect(format('Hi {a}', {})).toBe('Hi {a}'));
});

describe('translate', () => {
  it('returns the string for the active language', () => {
    expect(translate(hi, 'hi', 'plain')).toBe('सादा');
    expect(translate(en, 'en', 'greet', { name: 'Asha' })).toBe('Hello Asha');
  });
  it('uses the singular form for exactly one in English', () => {
    expect(translate(en, 'en', 'kids', { count: 1 })).toBe('1 child');
    expect(translate(en, 'en', 'kids', { count: 6 })).toBe('6 children');
  });
  it('follows Hindi plural rules (0 and 1 are singular)', () => {
    expect(translate(hi, 'hi', 'kids', { count: 1 })).toBe('1 बच्चा');
    expect(translate(hi, 'hi', 'kids', { count: 6 })).toBe('6 बच्चे');
  });
  it('returns the key itself when nothing matches, so missing strings are obvious', () => {
    expect(translate(en, 'en', 'nope')).toBe('nope');
  });
});
