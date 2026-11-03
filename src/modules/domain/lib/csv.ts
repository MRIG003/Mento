export type CsvValue = string | number | boolean | null;

/**
 * One CSV cell. Text starting with = + - @ TAB or CR is prefixed with ' so spreadsheets don't run it as a formula
 * (OWASP CSV injection; threat model T4), then quoted per RFC 4180 when needed.
 */
export function escapeCsvCell(value: CsvValue): string {
  if (value === null) return '';
  if (typeof value !== 'string') return String(value);
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** Whole file: UTF-8 BOM (so Excel shows Hindi correctly), CRLF line endings. */
export function toCsv(rows: readonly (readonly CsvValue[])[]): string {
  return `﻿${rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')}\r\n`;
}
