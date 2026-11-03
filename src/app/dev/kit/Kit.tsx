'use client';

import { Badge, Button, Card, EmptyState, FractionText, HighlighterMark, Icons, NameTag, PaperSkeleton, ProgressBar, StatusWord, StickyNote, TopBar } from '@/modules/foundation';

/** Visual check of the primitives (sample text is fixed; it is not app copy). */
export function Kit() {
  return (
    <>
      <TopBar title={'Kit'} badge={<Badge kind="demo" />} />
      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-6">
        <StickyNote tape as="section">
          <p className="font-hand text-[38px] leading-tight">{'6 students stuck on Fractions'}</p>
          <p className="mt-1 text-sm font-bold text-ink-muted">{'Class 6B Maths · 32 of 40 submitted'}</p>
        </StickyNote>
        <Card title={'Concepts'} titleId="kit-concepts">
          <ul className="flex flex-col gap-4">
            <li><p className="mb-1 font-bold">{'Adding fractions'}</p><ProgressBar label={'Adding fractions'} percent={82} status="on-track" /></li>
            <li><p className="mb-1 font-bold">{'Equivalent fractions'}</p><ProgressBar label={'Equivalent fractions'} percent={64} status="getting-there" /></li>
            <li><p className="mb-1 font-bold"><HighlighterMark>{'Comparing fractions'}</HighlighterMark></p><ProgressBar label={'Comparing fractions'} percent={41} status="stuck" /></li>
            <li><p className="mb-1 font-bold">{'Decimals'}</p><ProgressBar label={'Decimals'} percent={null} status="not-enough" /></li>
          </ul>
          <p className="mt-3 text-sm text-ink-muted"><FractionText text={'Most chose 3/5 < 2/5 · ३/४'} /></p>
        </Card>
        <section aria-label={'Needs help'}>
          <h2 className="mb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-ink-muted">{'Needs help'}</h2>
          <ul className="flex flex-wrap gap-3">
            {['Anaya', 'Dev', 'Sana', 'Rohan', 'Tara', 'Vihaan'].map((n, i) => <NameTag key={n} as="li" id={`kit_${n}`} name={n} animate delayMs={i * 60} />)}
          </ul>
        </section>
        <PaperSkeleton lines={3} />
        <EmptyState title={'Desk is clear.'} body={'Start with a homework.'} />
        <div className="flex flex-wrap gap-2"><Badge kind="demo" /><Badge kind="preview" /><Badge kind="late" /></div>
        <div className="flex flex-wrap gap-3">
          {(['pink', 'blue', 'mint', 'lilac', 'peach'] as const).map((c, i) => (
            <StickyNote key={c} color={c} rotate={[-2, 1.5, -1, 2, -2.5][i] ?? 0} className="w-36 text-sm font-bold">{c}</StickyNote>
          ))}
        </div>
        <Button icon={<Icons.PencilIcon />}>{'Give practice to these 6'}</Button>
        <div className="flex gap-3"><Button variant="secondary">{'Not now'}</Button><Button variant="quiet">{'Skip'}</Button><Button variant="secondary" busy>{'Saving'}</Button></div>
      </main>
    </>
  );
}
