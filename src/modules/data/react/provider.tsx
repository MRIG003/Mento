'use client';

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { Result } from '@/modules/domain';
import type { Repositories } from '../repositories';

/**
 * One client-side Repositories per page. The data layer (schemas, rules, scopes) is loaded with a dynamic import
 * after hydration so it never blocks first paint on slow phones (SPEC §8); screens show a paper skeleton meanwhile.
 */
let singleton: Repositories | null = null;
let loading: Promise<void> | null = null;
const waiting = new Set<() => void>();
function startLoading(): Promise<void> {
  loading ??= import('./browser').then(({ createBrowserRepositories }) => {
    singleton = createBrowserRepositories();
    waiting.forEach((n) => n());
  });
  return loading;
}
// Start downloading the data layer as soon as this module runs in the browser, in parallel with React's hydration,
// instead of waiting for the first subscription (measured with Lighthouse: LCP waits on this chunk).
if (typeof window !== 'undefined') void startLoading();
function subscribeRepositories(notify: () => void): () => void {
  waiting.add(notify);
  void startLoading();
  if (singleton) notify();
  return () => { waiting.delete(notify); };
}
const browserRepositories = () => singleton;

const RepositoriesContext = createContext<Repositories | null | undefined>(undefined);

/** Provides data access. `repositories` is for tests; the app uses the browser singleton (null during prerender). */
export function RepositoriesProvider({ children, repositories }: { children: ReactNode; repositories?: Repositories }) {
  const fromBrowser = useSyncExternalStore(subscribeRepositories, browserRepositories, () => null);
  return <RepositoriesContext.Provider value={repositories ?? fromBrowser}>{children}</RepositoriesContext.Provider>;
}

/** null until the page has hydrated in the browser. */
export function useRepositories(): Repositories | null {
  const value = useContext(RepositoriesContext);
  if (value === undefined) throw new Error('useRepositories must be used inside <RepositoriesProvider>');
  return value;
}

export type Live<T> =
  | { state: 'loading' }
  | { state: 'error'; error: Extract<Result<T>, { ok: false }>['error'] }
  | { state: 'ready'; data: T };

/**
 * Load data and keep it fresh: re-runs whenever the database changes (this tab or another).
 * `load` must be stable (wrap it in useCallback with its own dependencies).
 */
export function useLive<T>(load: (repos: Repositories) => Promise<Result<T>>): Live<T> {
  const repos = useRepositories();
  const [live, setLive] = useState<Live<T>>({ state: 'loading' });
  const [version, setVersion] = useState(0);

  useEffect(() => (repos ? repos.database.subscribe(() => setVersion((v) => v + 1)) : undefined), [repos]);

  useEffect(() => {
    if (!repos) return undefined;
    let cancelled = false;
    load(repos).then(
      (result) => { if (!cancelled) setLive(result.ok ? { state: 'ready', data: result.value } : { state: 'error', error: result.error }); },
      () => { if (!cancelled) setLive({ state: 'error', error: { code: 'UNAVAILABLE', messageKey: 'error.generic.body' } }); },
    );
    return () => { cancelled = true; };
  }, [repos, load, version]);

  return live;
}
