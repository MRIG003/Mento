/** Vitest stand-in for next/font/local, which only works inside the Next.js compiler. */
export default function localFont(options: { variable?: string }) {
  return { className: 'font-stub', variable: options.variable ?? '', style: { fontFamily: 'stub' } };
}
