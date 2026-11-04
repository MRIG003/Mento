'use client';

import { Card, TopBarFrame, useI18n, type TKey } from '@/modules/foundation';

const ROWS: { what: TKey; why: TKey; long: TKey }[] = [
  { what: 'privacy.row.name', why: 'privacy.why.roster', long: 'privacy.long.delete' },
  { what: 'privacy.row.answers', why: 'privacy.why.teach', long: 'privacy.long.delete' },
  { what: 'privacy.row.photos', why: 'privacy.why.teach', long: 'privacy.long.delete' },
  { what: 'privacy.row.consent', why: 'privacy.why.consent', long: 'privacy.long.delete' },
  { what: 'privacy.row.prefs', why: 'privacy.why.prefs', long: 'privacy.long.device' },
];

/** Public, plain-language "what we keep and for how long" (SPEC-privacy). Design intent, not legal advice. */
export function WhatWeKeep() {
  const { t } = useI18n();
  return (
    <>
      <TopBarFrame title={t('privacy.title')} />
      <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 py-5 pb-10">
        <p className="text-lg font-bold">{t('privacy.intro')}</p>
        <ul className="flex flex-col gap-3">
          {ROWS.map((r) => (
            <li key={r.what}><Card>
              <p className="text-lg font-extrabold">{t(r.what)}</p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="font-bold text-ink-muted">{t('privacy.where')}</dt><dd>{t('privacy.where.phone')}</dd>
                <dt className="font-bold text-ink-muted">{t('privacy.why')}</dt><dd>{t(r.why)}</dd>
                <dt className="font-bold text-ink-muted">{t('privacy.long')}</dt><dd>{t(r.long)}</dd>
              </dl>
            </Card></li>
          ))}
        </ul>
        <Card title={t('privacy.who')} titleId="who"><ul className="list-disc pl-5"><li>{t('privacy.who.teacher')}</li><li>{t('privacy.who.child')}</li><li>{t('privacy.who.principal')}</li></ul></Card>
        <Card title={t('privacy.rights')} titleId="rights"><p>{t('privacy.rights.body')}</p></Card>
        <p className="text-sm text-ink-muted">{t('privacy.note')}</p>
      </main>
    </>
  );
}
