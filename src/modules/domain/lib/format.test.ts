import { describe, expect, it } from 'vitest';
import { formatIndianNumber, ratePercent } from './format';

describe('formatIndianNumber', () => {
  it('uses lakh grouping in both languages with Western digits', () => {
    expect(formatIndianNumber(120000, 'en')).toBe('1,20,000');
    expect(formatIndianNumber(120000, 'hi')).toBe('1,20,000');
    expect(formatIndianNumber(999, 'hi')).toBe('999');
  });
});

describe('ratePercent', () => {
  it('rounds to a whole percent and is null without attempts', () => {
    expect(ratePercent({ attempted: 32, correct: 13 })).toBe(41);
    expect(ratePercent({ attempted: 0, correct: 0 })).toBeNull();
  });
});
