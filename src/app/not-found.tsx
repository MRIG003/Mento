'use client';

import { EmptyState, TopBarFrame, useI18n } from '@/modules/foundation';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <>
      <TopBarFrame title={t('common.appName')} />
      <main className="mx-auto max-w-xl px-4 py-10">
        <EmptyState title={t('error.notFound.title')} body={t('error.notFound.body')} />
      </main>
    </>
  );
}
