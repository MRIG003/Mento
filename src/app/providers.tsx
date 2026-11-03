'use client';

import type { ReactNode } from 'react';
import { RepositoriesProvider } from '@/modules/data';
import { I18nProvider } from '@/modules/foundation';
import { ServicesProvider } from '@/modules/services';

/** App-wide client providers: language, data, services. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <RepositoriesProvider>
        <ServicesProvider>{children}</ServicesProvider>
      </RepositoriesProvider>
    </I18nProvider>
  );
}
