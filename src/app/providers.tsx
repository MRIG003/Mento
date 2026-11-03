'use client';

import type { ReactNode } from 'react';
import { I18nProvider } from '@/modules/foundation';

/** App-wide client providers. Data and services providers join in T22. */
export function Providers({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
