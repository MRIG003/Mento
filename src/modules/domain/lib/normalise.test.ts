import { describe, expect, it } from 'vitest';
import { normaliseAnswer, parseNumber } from './normalise';

describe('normaliseAnswer', () => {
  it.each([
    ['NFC: decomposed é equals precomposed é', 'café', 'café'],
    ['strips zero-width joiner/non-joiner/space/BOM/word-joiner', '﻿भि‍न्न​‌⁠', 'भिन्न'],
    ['Devanagari digits become Western digits (५ = 5)', '३/४', '3/4'],
    ['all ten Devanagari digits', '०१२३४५६७८९', '0123456789'],
    ['collapses and trims whitespace, including non-breaking', '  आधा    भाग  ', 'आधा भाग'],
    ['removes spaces around / . and ,', ' 3 / 4 ', '3/4'],
    ['lowercases Latin text', 'NOUN', 'noun'],
    ['drops trailing full stop and danda', 'संज्ञा।', 'संज्ञा'],
    ['drops trailing double danda and question/exclamation marks', 'हाँ॥ !?', 'हाँ'],
    ['keeps a decimal point inside a number', '0.5.', '0.5'],
  ])('%s', (_name, input, expected) => {
    expect(normaliseAnswer(input)).toBe(expected);
  });

  it('typed-precomposed and typed-decomposed nukta letters compare equal', () => {
    expect(normaliseAnswer('ज़मीन')).toBe(normaliseAnswer('ज़मीन'));
  });

  describe('loose mode (common Hindi spelling variants)', () => {
    it('folds chandrabindu into anusvara (हँसना = हंसना)', () => {
      expect(normaliseAnswer('हँसना', { loose: true })).toBe(normaliseAnswer('हंसना', { loose: true }));
    });
    it('drops the nukta (ज़मीन = जमीन), precomposed or not', () => {
      expect(normaliseAnswer('ज़मीन', { loose: true })).toBe('जमीन');
      expect(normaliseAnswer('ज़मीन', { loose: true })).toBe('जमीन');
    });
    it('is off by default, so strict matching still tells them apart', () => {
      expect(normaliseAnswer('हँसना')).not.toBe(normaliseAnswer('हंसना'));
    });
  });
});

describe('parseNumber', () => {
  it.each([
    ['0.5', 0.5], ['.5', 0.5], ['-2', -2], ['12', 12], ['1,000', 1000], ['1,20,000', 120000], ['3.10', 3.1],
  ])('%s → %d', (input, expected) => expect(parseNumber(input)).toBe(expected));
  it.each(['3/4', 'abc', '', '1,2', '1.2.3', '5 apples', 'Infinity', '1e9'])('%s is not a plain number', (input) => {
    expect(parseNumber(input)).toBeNull();
  });
});
