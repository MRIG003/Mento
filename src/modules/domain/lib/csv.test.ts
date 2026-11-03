import { describe, expect, it } from 'vitest';
import { escapeCsvCell, toCsv } from './csv';

describe('escapeCsvCell (formula injection, threat model T4)', () => {
  it.each([
    ['=1+1', "'=1+1"],
    ['+919876543210', "'+919876543210"],
    ['-2', "'-2"],
    ['@SUM(A1)', "'@SUM(A1)"],
    ['\tTAB', "'\tTAB"],
    ['\rCR', "\"'\rCR\""],
    ['=HYPERLINK("http://x")', "\"'=HYPERLINK(\"\"http://x\"\")\""],
  ])('neutralises %j', (input, expected) => expect(escapeCsvCell(input)).toBe(expected));

  it.each([
    ['Anaya', 'Anaya'],
    ['अनाया', 'अनाया'],
    ['a,b', '"a,b"'],
    ['say "hi"', '"say ""hi"""'],
    ['line\nbreak', '"line\nbreak"'],
  ])('quotes per RFC 4180: %j', (input, expected) => expect(escapeCsvCell(input)).toBe(expected));

  it('writes numbers and booleans as plain values, and null as empty', () => {
    expect(escapeCsvCell(-3)).toBe('-3');
    expect(escapeCsvCell(true)).toBe('true');
    expect(escapeCsvCell(null)).toBe('');
  });
});

describe('toCsv', () => {
  it('joins rows with CRLF and starts with a BOM so Excel reads Hindi correctly', () => {
    expect(toCsv([['name', 'verdict'], ['अनाया', '=bad']])).toBe("﻿name,verdict\r\nअनाया,'=bad\r\n");
  });
});
