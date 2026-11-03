'use client';

import { Button, EmptyState, useI18n } from '@/modules/foundation';

/** Route error boundary: bilingual, no technical detail shown to users (threat model). */
export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <EmptyState title={t('error.generic.title')} body={t('error.generic.body')} action={<Button onClick={reset}>{t('common.retry')}</Button>} />
    </main>
  );
}
