# SPEC-services

Module id: `services` · Depends on: `domain` · Consumers: `homework`, `capture`, `family`, `principal`, `onboarding`.

## Objective
One contract per external capability Mento will need later, with a local implementation for v1. Every simulated
implementation carries `preview: true`, and the UI shows a "Preview" badge wherever its output appears.

## Contracts

```ts
type ServiceMeta = { preview: boolean };

/** Simulated. Never sends SMS. The mock shows the code on screen: "Preview: use 123456". */
export type OtpService = ServiceMeta & {
  requestCode(phone: string): Promise<Result<{ requestId: string; previewCode?: string }>>;  // phone validated: 10 digits, Indian mobile
  verify(requestId: string, code: string): Promise<Result<{ verified: true }>>;              // max 5 tries per requestId
};

/** REAL (preview: false). Builds a wa.me URL; the user taps to open WhatsApp and sends it themselves. */
export type ShareService = ServiceMeta & {
  whatsappUrl(message: string): string;           // 'https://wa.me/?text=' + encodeURIComponent(message); message ≤ 1000 chars
  copyLink(url: string): Promise<Result<void>>;    // navigator.clipboard, with a select-text fallback
  nativeShare?(data: { title: string; text: string; url: string }): Promise<Result<void>>;   // navigator.share when present
};

/** Simulated AI reading. Never final: the result is a suggestion the teacher confirms or overrides. */
export type HandwritingReader = ServiceMeta & {
  read(input: { photo: Blob; question: Question; qualityScore: number }):
    Promise<Result<{ suggestion: 'correct' | 'incorrect' | 'unreadable'; confidence: number /* 0..1 */ }>>;
};
// Mock: qualityScore < 0.5 → 'unreadable'; otherwise deterministic suggestion from a hash of the blob size, with
// confidence ≤ 0.8 so every item lands in teacher review.

/** Simulated. Output is always editable and marked as a machine draft. */
export type AutoTranslate = ServiceMeta & {
  translate(text: string, from: Lang, to: Lang): Promise<Result<{ text: string; machine: true }>>;
};
// Mock: exact-match glossary for bank phrases and UI-like phrases; otherwise returns UNAVAILABLE with messageKey
// 'translate.previewUnavailable' ("Preview: type the Hindi yourself"). It never invents a translation.

/** Simulated. No real money, no card fields, ever. */
export type PaymentsService = ServiceMeta & {
  startTrial(schoolId: SchoolId): Promise<Result<{ trialEndsAt: string }>>;   // 30 days
  requestUpgrade(schoolId: SchoolId, students: number): Promise<Result<{ quoteRangeInr: [number, number] }>>;  // 200-400 per student, labelled assumption
};

/** Preview placeholder for multi-device sync. v1 reports 'local-only'. */
export type SyncService = ServiceMeta & { status(): { mode: 'local-only' } };

export type Services = { otp: OtpService; share: ShareService; reader: HandwritingReader; translate: AutoTranslate; payments: PaymentsService; sync: SyncService };
export function createPreviewServices(deps: { clock: Clock; rng: RandomSource }): Services;
```

## Acceptance
- `whatsappUrl` encodes `& # ? \n` and Devanagari correctly (round-trip test with `decodeURIComponent`); rejects or truncates at 1000 chars.
- OTP mock: wrong code → `VALIDATION`; 6th try → `FORBIDDEN`; valid → verified.
- Reader mock never returns confidence > 0.8; quality < 0.5 → `unreadable`.
- AutoTranslate mock never returns text for an unknown phrase.
- Every Preview implementation exports `preview: true`; a component test asserts the badge renders next to its output.
- Only `share` is real, and it makes no network call itself (the URL is opened by the user's tap).
