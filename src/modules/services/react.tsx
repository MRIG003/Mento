'use client';

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import { cryptoRandom } from '@/modules/domain';
import { createPreviewServices, type Services } from './index';

let singleton: Services | null = null;
function browserServices(): Services {
  singleton ??= createPreviewServices({
    clock: { now: () => new Date() },
    rng: cryptoRandom,
    ...(typeof navigator !== 'undefined' && typeof navigator.share === 'function' ? { share: (data: ShareData) => navigator.share(data) } : {}),
  });
  return singleton;
}
const noop = () => () => {};

const ServicesContext = createContext<Services | null | undefined>(undefined);

export function ServicesProvider({ children, services }: { children: ReactNode; services?: Services }) {
  const fromBrowser = useSyncExternalStore(noop, browserServices, () => null);
  return <ServicesContext.Provider value={services ?? fromBrowser}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services | null {
  const value = useContext(ServicesContext);
  if (value === undefined) throw new Error('useServices must be used inside <ServicesProvider>');
  return value;
}
