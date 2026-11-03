/**
 * External capabilities behind contracts (SPEC-services). v1 ships local implementations; everything simulated is
 * `preview: true` and the UI shows a "Preview" badge next to its output.
 */
import { err, newId, ok, type Clock, type Lang, type Question, type RandomSource, type Result, type SchoolId } from './deps';
import { GLOSSARY } from './glossary';

type ServiceMeta = { preview: boolean };

export type OtpService = ServiceMeta & {
  requestCode(phone: string): Promise<Result<{ requestId: string; previewCode?: string }>>;
  verify(requestId: string, code: string): Promise<Result<{ verified: true }>>;
};
export type ShareService = ServiceMeta & {
  whatsappUrl(message: string): string;
  copyLink(url: string): Promise<Result<void>>;
  nativeShare?(data: { title: string; text: string; url: string }): Promise<Result<void>>;
};
export type HandwritingReader = ServiceMeta & {
  read(input: { photo: Blob; question: Question; qualityScore: number }): Promise<Result<{ suggestion: 'correct' | 'incorrect' | 'unreadable'; confidence: number }>>;
};
export type AutoTranslate = ServiceMeta & { translate(text: string, from: Lang, to: Lang): Promise<Result<{ text: string; machine: true }>> };
export type PaymentsService = ServiceMeta & {
  startTrial(schoolId: SchoolId): Promise<Result<{ trialEndsAt: string }>>;
  requestUpgrade(schoolId: SchoolId, students: number): Promise<Result<{ quoteRangeInr: [number, number] }>>;
};
export type SyncService = ServiceMeta & { status(): { mode: 'local-only' } };
export type Services = { otp: OtpService; share: ShareService; reader: HandwritingReader; translate: AutoTranslate; payments: PaymentsService; sync: SyncService };

export const PREVIEW_OTP_CODE = '123456';
const MAX_OTP_TRIES = 5;
const OTP_TTL_MS = 10 * 60 * 1000;
const WA_MAX = 1000;
/** Pricing assumption to validate (owner's prompt §3); shown as an assumption, never as a fact. */
export const PRICE_PER_STUDENT_INR: [number, number] = [200, 400];

type Deps = {
  clock: Clock;
  rng: RandomSource;
  clipboard?: { writeText(text: string): Promise<void> };
  share?: (data: { title: string; text: string; url: string }) => Promise<void>;
};

export function createPreviewServices(deps: Deps): Services {
  const requests = new Map<string, { tries: number; expires: number }>();
  const nativeShare = deps.share;

  const otp: OtpService = {
    preview: true,
    async requestCode(phone) {
      const digits = phone.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');
      if (!/^[6-9]\d{9}$/.test(digits)) return err('VALIDATION', 'otp.phoneInvalid');
      const requestId = newId('otp', deps.rng);
      requests.set(requestId, { tries: 0, expires: deps.clock.now().getTime() + OTP_TTL_MS });
      return ok({ requestId, previewCode: PREVIEW_OTP_CODE });
    },
    async verify(requestId, code) {
      const req = requests.get(requestId);
      if (!req) return err('NOT_FOUND', 'otp.expired');
      if (deps.clock.now().getTime() > req.expires) return err('FORBIDDEN', 'otp.expired');
      if (req.tries >= MAX_OTP_TRIES) return err('FORBIDDEN', 'otp.tooMany');
      req.tries += 1;
      if (code.trim() !== PREVIEW_OTP_CODE) return err('VALIDATION', 'otp.wrong');
      requests.delete(requestId);
      return ok({ verified: true });
    },
  };

  const share: ShareService = {
    preview: false,
    whatsappUrl: (message) => `https://wa.me/?text=${encodeURIComponent([...message].slice(0, WA_MAX).join(''))}`,
    async copyLink(url) {
      const clipboard = deps.clipboard ?? globalThis.navigator?.clipboard;
      try {
        if (!clipboard) throw new Error('no clipboard');
        await clipboard.writeText(url);
        return ok(undefined);
      } catch {
        return err('UNAVAILABLE', 'share.copyFailed');
      }
    },
    ...(nativeShare ? { nativeShare: async (data: { title: string; text: string; url: string }) => {
      try { await nativeShare(data); return ok(undefined); } catch { return err('UNAVAILABLE', 'share.copyFailed'); }
    } } : {}),
  };

  const reader: HandwritingReader = {
    preview: true,
    async read({ photo, qualityScore }) {
      if (qualityScore < 0.5) return ok({ suggestion: 'unreadable', confidence: 0 });
      // Deterministic stand-in for an AI model; confidence stays ≤ 0.8 so every photo goes to teacher review.
      const confidence = Math.round((0.55 + (photo.size % 25) / 100) * 100) / 100;
      return ok({ suggestion: photo.size % 2 === 0 ? 'correct' : 'incorrect', confidence: Math.min(confidence, 0.8) });
    },
  };

  const translate: AutoTranslate = {
    preview: true,
    async translate(text, from, to) {
      const key = text.trim();
      const hit = from === to ? key : GLOSSARY.find((pair) => pair[from] === key)?.[to];
      return hit ? ok({ text: hit, machine: true }) : err('UNAVAILABLE', 'translate.previewUnavailable');
    },
  };

  const payments: PaymentsService = {
    preview: true,
    async startTrial() {
      return ok({ trialEndsAt: new Date(deps.clock.now().getTime() + 30 * 86_400_000).toISOString() });
    },
    async requestUpgrade(_schoolId, students) {
      return ok({ quoteRangeInr: [PRICE_PER_STUDENT_INR[0] * students, PRICE_PER_STUDENT_INR[1] * students] });
    },
  };

  return { otp, share, reader, translate, payments, sync: { preview: true, status: () => ({ mode: 'local-only' }) } };
}
