'use client';

import { useI18n, type TKey } from '../i18n/provider';
import { TopBar } from './TopBar';

/** Temporary screen for routes whose module is not built yet (removed as each slice lands). */
export function PlaceholderScreen({ titleKey }: { titleKey: TKey }) {
  const { t } = useI18n();
  return (
    <>
      <TopBar title={t(titleKey)} />
      <main className="mx-auto max-w-xl px-4 py-8 text-ink-muted">{t('common.notBuiltYet')}</main>
    </>
  );
}
