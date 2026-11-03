/**
 * Answer normalisation for matching typed answers (SPEC-domain §Rules). Order matters:
 * NFC first, so precomposed nukta letters (U+0958-U+095F, composition exclusions) become base + U+093C.
 */
const ZERO_WIDTH = /[​-‍⁠﻿]/g;
const DEVANAGARI_DIGIT = /[०-९]/g;
const CHANDRABINDU = /ँ/g;
const NUKTA = /़/g;

export type NormaliseOptions = { loose?: boolean };

export function normaliseAnswer(input: string, options: NormaliseOptions = {}): string {
  let s = input.normalize('NFC').replace(ZERO_WIDTH, '');
  if (options.loose) s = s.replace(CHANDRABINDU, 'ं').replace(NUKTA, '');
  s = s.replace(DEVANAGARI_DIGIT, (d) => String(d.charCodeAt(0) - 0x0966));
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/\s*([/.,])\s*/g, '$1');
  s = s.toLowerCase();
  s = s.replace(/[\s.,।॥!?]+$/u, '');
  return s;
}

/** A plain decimal number (optionally with Indian/Western digit grouping), else null. Fractions are not numbers here. */
export function parseNumber(normalised: string): number | null {
  const plain = /^-?(\d+(\.\d+)?|\.\d+)$/;
  const grouped = /^-?\d{1,3}(,\d{2,3})+(\.\d+)?$/;
  if (!plain.test(normalised) && !grouped.test(normalised)) return null;
  const value = Number(normalised.replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
}

/** Word tokens for key-point matching (Latin and Devanagari; punctuation and dandas split words). */
export function tokens(normalised: string): string[] {
  return normalised.split(/[\s.,;:!?।॥()"'“”‘’\-–—/]+/u).filter(Boolean);
}
