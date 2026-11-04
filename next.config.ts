import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

// Threat model §4. CSP from Next 16.4.2 docs, guides/content-security-policy.md, "Without Nonces".
// 'unsafe-inline' for scripts is required: Next's static pages hydrate from inline RSC payload scripts,
// which SRI does not cover (verified in T2, ADR-008). Dev also needs 'unsafe-eval' (same doc).
const cspFor = (fontSrc: string) => [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  `font-src ${fontSrc}`,
  "connect-src 'self'",
  "media-src 'self' blob:",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'", // only our own /present page may frame the app (threat model; no other site can)
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const baseHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const securityHeaders = [{ key: 'Content-Security-Policy', value: cspFor("'self'") }, ...baseHeaders];
// The static /present deck embeds its fonts as data: URIs, so only that path also allows data: fonts.
const presentHeaders = [{ key: 'Content-Security-Policy', value: cspFor("'self' data:") }, ...baseHeaders];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Tailwind's one small stylesheet is inlined so it no longer blocks first paint (docs: next-config-js/inlineCss).
  experimental: { inlineCss: true },
  async headers() {
    return [
      { source: '/((?!present).*)', headers: securityHeaders },
      { source: '/present/:path*', headers: presentHeaders },
      { source: '/present', headers: presentHeaders },
    ];
  },
  async rewrites() {
    return [{ source: '/present', destination: '/present/index.html' }];
  },
};

export default nextConfig;
