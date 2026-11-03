import { describe, expect, it } from 'vitest';
import { cryptoRandom, generateToken, newId, seededRandom } from './token';

describe('generateToken (link and join tokens, threat model S1)', () => {
  it('is 22 base64url characters (128 bits, no padding)', () => {
    const token = generateToken(cryptoRandom);
    expect(token).toMatch(/^[A-Za-z0-9_-]{22}$/);
  });
  it('does not repeat across 10,000 tokens', () => {
    const tokens = new Set(Array.from({ length: 10_000 }, () => generateToken(cryptoRandom)));
    expect(tokens.size).toBe(10_000);
  });
  it('asks the random source for exactly 16 bytes', () => {
    const asked: number[] = [];
    generateToken({ bytes: (n) => { asked.push(n); return new Uint8Array(n); } });
    expect(asked).toEqual([16]);
  });
});

describe('newId', () => {
  it('prefixes a short random part and stays url- and storage-safe', () => {
    expect(newId('stu', cryptoRandom)).toMatch(/^stu_[A-Za-z0-9_-]{14}$/);
  });
});

describe('seededRandom (demo data only)', () => {
  it('repeats the same bytes for the same seed', () => {
    expect(seededRandom(42).bytes(8)).toEqual(seededRandom(42).bytes(8));
    expect(seededRandom(42).bytes(8)).not.toEqual(seededRandom(43).bytes(8));
  });
});
