import type { RandomSource } from '../types';

/** Production randomness: Web Crypto (crypto.getRandomValues), available in browsers and Node ≥ 19. */
export const cryptoRandom: RandomSource = {
  bytes: (n) => globalThis.crypto.getRandomValues(new Uint8Array(n)),
};

/** Deterministic randomness for demo data and tests only (mulberry32). Never for tokens a real user receives. */
export function seededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  };
  return { bytes: (n) => Uint8Array.from({ length: n }, () => next() & 0xff) };
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** base64url without padding. */
function base64url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0;
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    const n = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);
    out += ALPHABET[(n >> 18) & 63] + (ALPHABET[(n >> 12) & 63] ?? '');
    if (b !== undefined) out += ALPHABET[(n >> 6) & 63] ?? '';
    if (c !== undefined) out += ALPHABET[n & 63] ?? '';
  }
  return out;
}

/** 128-bit unguessable token for homework and join links (ADR-009, threat model S1). 22 characters. */
export function generateToken(rng: RandomSource): string {
  return base64url(rng.bytes(16));
}

/** Record id: `<prefix>_<14 base64url chars>` (~84 bits). Ids are not secrets; tokens are. */
export function newId(prefix: string, rng: RandomSource): string {
  return `${prefix}_${base64url(rng.bytes(11)).slice(0, 14)}`;
}
