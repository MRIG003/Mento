'use client';

import { Fragment } from 'react';
import { useI18n } from '../i18n/provider';

const FRACTION = /(\d+|[०-९]+)\/(\d+|[०-९]+)/g;

/** A stacked fraction. Screen readers hear "3 over 4" / "3 बटा 4" instead of "3 slash 4". */
export function Fraction({ n, d }: { n: string; d: string }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex align-middle">
      <span className="sr-only">{t('fraction.read', { n, d })}</span>
      <span aria-hidden="true" className="mx-0.5 inline-flex flex-col items-center text-[0.8em] font-bold leading-none">
        <span className="px-0.5">{n}</span>
        <span className="h-px w-full bg-current" />
        <span className="px-0.5">{d}</span>
      </span>
    </span>
  );
}

/** Plain text with `a/b` shown as stacked fractions (teacher content is text only; threat model T2). */
export function FractionText({ text }: { text: string }) {
  const parts: (string | { n: string; d: string })[] = [];
  let last = 0;
  for (const match of text.matchAll(FRACTION)) {
    const index = match.index;
    if (index > last) parts.push(text.slice(last, index));
    parts.push({ n: match[1] ?? '', d: match[2] ?? '' });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>{typeof part === 'string' ? part : <Fraction n={part.n} d={part.d} />}</Fragment>
      ))}
    </>
  );
}
