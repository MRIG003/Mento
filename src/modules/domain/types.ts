import type { I18nKey } from '@/i18n/en';

export type Clock = { now(): Date };
export type RandomSource = { bytes(n: number): Uint8Array };

export type ErrorCode = 'NOT_FOUND' | 'VALIDATION' | 'FORBIDDEN' | 'CONFLICT' | 'STORAGE' | 'UNAVAILABLE';
/** One error shape everywhere (SPEC §9). The UI shows t(messageKey); details are for logs/tests only. */
export type AppError = { code: ErrorCode; messageKey: I18nKey; details?: unknown };
export type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = (code: ErrorCode, messageKey: I18nKey, details?: unknown): Result<never> =>
  ({ ok: false, error: details === undefined ? { code, messageKey } : { code, messageKey, details } });
