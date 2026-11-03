import { describe, expect, it } from 'vitest';
import { linkPathFromPaste } from './link';

describe('linkPathFromPaste (pasted text is untrusted)', () => {
  const token = 'AbCdEfGhIjKlMnOpQrSt_-';
  it.each([
    [`https://mento.example/h#k=${token}&lang=hi`, `/h#k=${token}&lang=hi`],
    [`mento.example/h#k=${token}`, `/h#k=${token}`],
    [`  Homework: https://x.y/h#lang=en&k=${token} thanks`, `/h#k=${token}&lang=en`],
    [`https://x.y/join#k=${token}`, `/join#k=${token}`],
  ])('keeps only the route, token and language from %j', (input, expected) => expect(linkPathFromPaste(input)).toBe(expected));
  it.each(['', 'hello', 'https://evil.example/h#k=short', 'javascript:alert(1)#k=AbCdEfGhIjKlMnOpQrSt_-', `https://x.y/h#k=${token}&lang=fr<script>`])('rejects %j', (input) => {
    expect(linkPathFromPaste(input)?.includes('<') ?? false).toBe(false);
    if (!input.includes(token)) expect(linkPathFromPaste(input)).toBeNull();
  });
  it('drops an unknown language rather than passing it through', () => {
    expect(linkPathFromPaste(`https://x.y/h#k=${token}&lang=fr`)).toBe(`/h#k=${token}`);
  });
});
