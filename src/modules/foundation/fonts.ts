import localFont from 'next/font/local';

// Self-hosted fonts (no third-party requests). next/font/local per Next 16.4.2 docs (api-reference/components/font.md).
// Nunito is preloaded (UI). Noto Sans Devanagari and Caveat are fetched only when used, to keep first load light.
export const nunito = localFont({
  src: [
    { path: '../../fonts/nunito-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../fonts/nunito-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: '../../fonts/nunito-latin-800-normal.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-nunito',
  display: 'swap',
  preload: true,
});

export const notoDevanagari = localFont({
  src: [
    { path: '../../fonts/noto-sans-devanagari-devanagari-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../fonts/noto-sans-devanagari-devanagari-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../fonts/noto-sans-devanagari-devanagari-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-noto-deva',
  display: 'swap',
  preload: false,
});

export const caveat = localFont({
  src: [{ path: '../../fonts/caveat-latin-600-normal.woff2', weight: '600', style: 'normal' }],
  variable: '--font-caveat',
  display: 'swap',
  preload: false,
});

export const fontVariables = `${nunito.variable} ${notoDevanagari.variable} ${caveat.variable}`;
