# Threat model: Mento v1

Status: Draft (Phase 2). Reviewed again in Phase 5 against the built app. Skill: security-and-hardening.
Scope: a static Next.js app on Vercel; all data in the browser (localStorage + IndexedDB); no backend, no accounts.
*Design intent, not legal advice. Counsel must review before real children's data is used.*

## 1. Assets
| Asset | Why it matters |
|---|---|
| Children's first names, answers, photos of notebooks | Children's personal data (DPDP). Highest sensitivity. |
| Consent records | Proof of permission; must not be forged or lost silently. |
| Link and join tokens | Grant access to a homework / roster. |
| Teacher-authored content | Rendered to children; a vector for injection. |
| Aggregates for principals | Must not reveal individuals. |
| App integrity (scripts, headers) | A compromised script would expose everything on the device. |

## 2. Trust boundaries
1. **URL** (fragment `k`, `lang`, `preview`; query `hw`, `id`, `v`, `mission`): attacker-controlled.
2. **Local storage** (localStorage `mento:db`, `mento:prefs`; IndexedDB blobs): can be stale, corrupt, edited by the user or by
   another tab or extension. **Treated as untrusted.**
3. **Form input** (names, questions, answers, phone, class labels, pasted rosters).
4. **Files and camera frames** (file picker, getUserMedia).
5. **Outbound links** (wa.me, clipboard, native share).
6. **Role boundary** inside the app (teacher / student link / principal) on a shared device.
7. **Supply chain** (npm dependencies, build).

## 3. STRIDE by boundary

| # | Threat | Boundary | Mitigation (where) |
|---|---|---|---|
| S1 | Guessing a homework or join link to see a class roster | URL | 128-bit tokens from `crypto.getRandomValues` (domain `generateToken`); unknown token → generic error; no enumeration endpoint exists |
| S2 | A child picks a sibling's name | Role | "You are X? · Not me" confirm; the teacher can reassign; v1 accepts this risk (shared phones are the norm) |
| T1 | Edited or corrupt localStorage alters marks or crashes the app | Storage | Parse-on-read with zod + versioned migrations; quarantine on failure (`mento:db:corrupt:*`); never `eval` stored data |
| T2 | XSS through teacher content, names or pasted rosters | Form → render | React text rendering only; **no `dangerouslySetInnerHTML` / `innerHTML`** (lint rule); plain text plus our own `Fraction` component; length limits |
| T3 | Injection into wa.me or other URL schemes | Outbound | Fixed origin `https://wa.me/?text=` + `encodeURIComponent`; no user-controlled scheme or host; links built only by `ShareService` |
| T4 | CSV formula injection when the teacher opens an export in Excel or Sheets | Export | `escapeCsvCell` prefixes `= + - @ \t \r` with `'`, plus RFC 4180 quoting (unit-tested) |
| T5 | Malicious image file (polyglot, huge) | File | Type check by magic bytes (JPEG/PNG/WebP), ≤ 10 MB, decode via `createImageBitmap`, re-encode via canvas (strips EXIF/GPS and any payload); never insert into the DOM as HTML |
| R1 | A teacher's override can't be traced | Storage | `Evaluation.by` and `overriddenFrom` are kept; consent records hold `grantedAt` / `grantedBy`, and withdrawals are timestamped, not deleted |
| I1 | Link holder sees more than their own work | Role | `StudentLinkScope` returns the homework *without answer keys*, class first names only (after a valid token), and the claimed student's own work only. **Decision: a link holder sees the class's first names and nothing else.** |
| I2 | The principal sees individuals | Role | `PrincipalScope` returns `SchoolAggregates`, which has no id or name fields (type test + runtime allowlist); cells with fewer than 3 attempts are suppressed |
| I3 | Tokens or names leak via URL, logs or Referer | URL | Tokens live in the **fragment** (never sent to the server); no names in any URL; `Referrer-Policy: no-referrer` |
| I4 | Photo location metadata leaks | File | Canvas re-encode drops EXIF; photos never leave the device in v1 |
| I5 | Third-party scripts read data | Supply chain / HTTP | No third-party scripts, analytics or trackers; CSP `default-src 'self'`; fonts self-hosted |
| I6 | Camera stays on in the background | Camera | Permission requested only on tap; all tracks stopped on unmount, route change and `visibilitychange`; object URLs revoked |
| I7 | Data left on a shared phone | Storage | "Delete all my data on this phone"; student link keeps only the claim + drafts for that token; a "Switch child" option exists |
| D1 | Huge pasted roster or text freezes a low-end phone | Form | Limits: roster ≤ 80 names × 30 chars; prompt ≤ 300; answers ≤ 500; option ≤ 80 |
| D2 | Storage quota exceeded by photos | Storage | Compression to ≤ ~300 KB; `STORAGE` error with a bilingual message; drafts stay in memory until saved |
| E1 | A student-link session reaches teacher screens on a shared device | Role | Teacher routes require the device's teacher session state (set after OTP-Preview onboarding). **v1 limitation:** on a single shared device this isn't a security boundary against the device owner. Documented, and resolved when a backend adds real auth |
| E2 | Supply-chain compromise | Build | Short dependency list (SPEC §2), exact pins, versions ≥ 14 days old, committed lockfile, `npm audit` before release, no postinstall scripts beyond the framework's own |

## 4. HTTP security headers (next.config `headers()`, all routes)
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:;
  font-src 'self'; connect-src 'self'; media-src 'self' blob:; worker-src 'self'; manifest-src 'self'; object-src 'none';
  base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(self), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=63072000; includeSubDomains (Vercel serves HTTPS)
Cross-Origin-Opener-Policy: same-origin
```
`script-src` includes `'unsafe-inline'`: T2 showed that Next's static pages hydrate from inline RSC payload scripts that SRI
does not cover (ADR-008, with evidence). The mitigation is no HTML rendering of user content (T2 row above). `style-src 'unsafe-inline'` is needed for React inline style attributes (rotations), and the
risk is low with no user-controlled CSS. Dev adds `'unsafe-eval'` only in development (as the Next docs advise).

## 5. Abuse cases (each becomes a first test in its slice)
- A question prompt `<img src=x onerror=alert(1)>` renders as literal text.
- Fragment `#k=../../etc&lang=<script>` → "This link doesn't work", no crash, no reflection.
- A pasted roster with 10,000 lines → truncated to 80 with a message.
- A stored `mento:db` set to `{"schemaVersion":99}` → quarantined, recovery offered.
- An exported cell `=HYPERLINK("http://x")` → `'=HYPERLINK(...)`.
- A `.jpg` that is actually HTML → rejected by the magic-byte check.
- The principal scope asked for class 6B's student list → no such method; the runtime allowlist test fails if a field is added.

## 6. Compliance notes (DPDP-minded)
Consent per student before link submission; purpose limitation (teaching only; no ads, no profiling beyond teaching rules);
data minimisation (first names only, no phone numbers of children, parent phone not stored); export and delete; a retention
statement; the school-paid model. A real deployment needs a privacy notice reviewed by counsel, a verifiable parental-consent
process, and a processor agreement for any backend.

## Change log
- 2026-11-04: framing allowed for the app's own origin only (`frame-ancestors 'self'`, `X-Frame-Options: SAMEORIGIN`) so the `/present` page can show the live app in a phone frame. Other sites still cannot frame it. `/demo?to=` only redirects to an allowlist of internal paths.
