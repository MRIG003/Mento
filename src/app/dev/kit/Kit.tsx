'use client';

import { Badge, Button, Card, Icons, StatusWord, StickyNote, TopBar } from '@/modules/foundation';

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
          <ul className="flex flex-col gap-2">
            <li className="flex justify-between"><span>{'Adding fractions'}</span><StatusWord status="on-track" /></li>
            <li className="flex justify-between"><span>{'Equivalent fractions'}</span><StatusWord status="getting-there" /></li>
            <li className="flex justify-between"><span>{'Comparing fractions'}</span><StatusWord status="stuck" /></li>
            <li className="flex justify-between"><span>{'Decimals'}</span><StatusWord status="not-enough" /></li>
          </ul>
        </Card>
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
