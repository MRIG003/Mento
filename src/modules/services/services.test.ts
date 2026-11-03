import { describe, expect, it, vi } from 'vitest';
import { seededRandom } from '@/modules/domain';
import { createPreviewServices } from './index';

const clock = { now: () => new Date('2026-11-03T15:00:00.000Z') };
const services = (extra = {}) => createPreviewServices({ clock, rng: seededRandom(1), ...extra });

describe('every simulated service says so', () => {
  it('flags OTP, reader, translate, payments and sync as Preview, and share as real', () => {
    const s = services();
    expect([s.otp.preview, s.reader.preview, s.translate.preview, s.payments.preview, s.sync.preview]).toEqual([true, true, true, true, true]);
    expect(s.share.preview).toBe(false);
  });
});

describe('OtpService (Preview: never sends an SMS)', () => {
  it('accepts Indian mobile formats and shows the code on screen', async () => {
    for (const phone of ['9876543210', '+91 98765 43210', '098765-43210']) {
      const r = await services().otp.requestCode(phone);
      expect(r.ok && r.value.previewCode).toBe('123456');
    }
  });
  it('rejects numbers that are not 10-digit Indian mobiles', async () => {
    for (const phone of ['12345', '5876543210', 'abcdefghij']) {
      expect(await services().otp.requestCode(phone)).toMatchObject({ ok: false, error: { code: 'VALIDATION', messageKey: 'otp.phoneInvalid' } });
    }
  });
  it('verifies the right code, refuses a wrong one, and locks after 5 tries', async () => {
    const s = services();
    const req = await s.otp.requestCode('9876543210');
    if (!req.ok) throw new Error();
    expect(await s.otp.verify(req.value.requestId, '000000')).toMatchObject({ ok: false, error: { messageKey: 'otp.wrong' } });
    for (let i = 0; i < 4; i += 1) await s.otp.verify(req.value.requestId, '000000');
    expect(await s.otp.verify(req.value.requestId, '123456')).toMatchObject({ ok: false, error: { code: 'FORBIDDEN', messageKey: 'otp.tooMany' } });
    const again = await s.otp.requestCode('9876543210');
    if (!again.ok) throw new Error();
    expect(await s.otp.verify(again.value.requestId, '123456')).toEqual({ ok: true, value: { verified: true } });
  });
});

describe('ShareService (real wa.me link, never auto-sends; threat model T3)', () => {
  it('builds a fixed-origin URL with the message encoded, Devanagari and symbols included', () => {
    const msg = 'कक्षा 6B गणित का होमवर्क: भिन्न & more?\nखोलें: https://mento.example/h#k=abc&lang=hi';
    const url = services().share.whatsappUrl(msg);
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    expect(decodeURIComponent(url.slice('https://wa.me/?text='.length))).toBe(msg);
    expect(url).not.toContain(' ');
    expect(url).not.toContain('\n');
  });
  it('caps the message at 1000 characters', () => {
    const url = services().share.whatsappUrl('x'.repeat(5000));
    expect(decodeURIComponent(url.split('=')[1]!).length).toBe(1000);
  });
  it('copies through the clipboard and reports failure kindly', async () => {
    const writeText = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('denied'));
    const s = services({ clipboard: { writeText } });
    expect(await s.share.copyLink('https://x')).toEqual({ ok: true, value: undefined });
    expect(await s.share.copyLink('https://x')).toMatchObject({ ok: false, error: { messageKey: 'share.copyFailed' } });
  });
});

describe('HandwritingReader (Preview: a suggestion, never a score)', () => {
  it('calls poor photos unreadable and never claims more than 0.8 confidence', async () => {
    const s = services();
    const q = { id: 'q', conceptId: 'c', type: 'photo', difficulty: 1, source: 'bank', prompt: { en: 'p' } } as never;
    expect(await s.reader.read({ photo: new Blob(['x']), question: q, qualityScore: 0.3 })).toMatchObject({ ok: true, value: { suggestion: 'unreadable' } });
    for (let n = 1; n < 60; n += 7) {
      const r = await s.reader.read({ photo: new Blob(['y'.repeat(n)]), question: q, qualityScore: 0.9 });
      expect(r.ok && r.value.confidence).toBeLessThanOrEqual(0.8);
    }
  });
});

describe('AutoTranslate (Preview: never invents a translation)', () => {
  it('translates known phrases both ways', async () => {
    const s = services();
    expect(await s.translate.translate('Comparing fractions', 'en', 'hi')).toEqual({ ok: true, value: { text: 'भिन्नों की तुलना', machine: true } });
    expect(await s.translate.translate('भिन्न', 'hi', 'en')).toEqual({ ok: true, value: { text: 'Fractions', machine: true } });
  });
  it('returns UNAVAILABLE for anything it does not know', async () => {
    expect(await services().translate.translate('My own question about mangoes', 'en', 'hi')).toMatchObject({ ok: false, error: { code: 'UNAVAILABLE', messageKey: 'translate.previewUnavailable' } });
  });
});

describe('PaymentsService (Preview: no money moves)', () => {
  it('starts a 30-day trial and quotes the assumed ₹200-400 per student range', async () => {
    const s = services();
    expect(await s.payments.startTrial('sch_demo' as never)).toEqual({ ok: true, value: { trialEndsAt: '2026-12-03T15:00:00.000Z' } });
    expect(await s.payments.requestUpgrade('sch_demo' as never, 106)).toEqual({ ok: true, value: { quoteRangeInr: [21200, 42400] } });
  });
});

describe('SyncService', () => {
  it('reports local-only in v1', () => expect(services().sync.status()).toEqual({ mode: 'local-only' }));
});
