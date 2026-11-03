import { describe, expect, it } from 'vitest';
import { parsePrefs } from './prefs-store';

describe('parsePrefs (stored preferences are untrusted)', () => {
  it('keeps valid fields', () => {
    expect(parsePrefs('{"lang":"hi","textSize":115,"sound":true}')).toEqual({ lang: 'hi', textSize: 115, sound: true });
  });
  it('drops unknown or invalid fields', () => {
    expect(parsePrefs('{"lang":"fr","textSize":999,"sound":"yes","evil":"<script>"}')).toEqual({});
  });
  it('survives broken JSON, null and non-objects', () => {
    expect(parsePrefs('{oops')).toEqual({});
    expect(parsePrefs(null)).toEqual({});
    expect(parsePrefs('42')).toEqual({});
    expect(parsePrefs('null')).toEqual({});
  });
});
