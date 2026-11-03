'use client';

import { TopBar, useI18n } from '@/modules/foundation';

/** T7 placeholder for the Desk; replaced by the desk module in T25. */
export default function TeacherDeskPage() {
  const { t } = useI18n();
  return (
    <>
      <TopBar title={t('tab.teacher.desk')} />
      <main className="mx-auto max-w-xl px-4 py-6">
        <label className="block font-bold">
          {t('common.loading')}
          <input data-testid="probe-input" className="mt-2 block w-full rounded-card border border-line bg-card p-3" />
        </label>
      </main>
    </>
  );
}
