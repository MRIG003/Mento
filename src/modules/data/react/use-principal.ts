'use client';

import { useCallback, useMemo } from 'react';
import type { SchoolId } from '@/modules/domain';
import type { Repositories } from '../repositories';
import type { PrincipalScope } from '../scopes/principal';
import { useLive, useRepositories } from './provider';

export type PrincipalSession = { state: 'loading' } | { state: 'signed-out' } | { state: 'ready'; schoolId: SchoolId; scope: PrincipalScope };

/** The principal on this device (school chosen with a school code), or 'signed-out'. */
export function usePrincipal(): PrincipalSession {
  const repos = useRepositories();
  const session = useLive(useCallback((r: Repositories) => r.session.get(), []));
  const schoolId = session.state === 'ready' ? session.data.principalSchoolId ?? null : null;
  return useMemo<PrincipalSession>(() => {
    if (!repos || session.state === 'loading') return { state: 'loading' };
    if (!schoolId) return { state: 'signed-out' };
    return { state: 'ready', schoolId, scope: repos.principal(schoolId) };
  }, [repos, session.state, schoolId]);
}
