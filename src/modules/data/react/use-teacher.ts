'use client';

import { useCallback, useMemo } from 'react';
import type { TeacherId } from '@/modules/domain';
import type { Repositories } from '../repositories';
import type { TeacherScope } from '../scopes/teacher';
import { useLive, useRepositories } from './provider';

export type TeacherSession = { state: 'loading' } | { state: 'signed-out' } | { state: 'ready'; teacherId: TeacherId; scope: TeacherScope; repos: Repositories };

/** The teacher on this device, or 'signed-out' (screens then point to onboarding or the demo). */
export function useTeacher(): TeacherSession {
  const repos = useRepositories();
  const session = useLive(useCallback((r: Repositories) => r.session.get(), []));
  const teacherId = session.state === 'ready' ? session.data.teacherId ?? null : null;
  return useMemo<TeacherSession>(() => {
    if (!repos || session.state === 'loading') return { state: 'loading' };
    if (!teacherId) return { state: 'signed-out' };
    return { state: 'ready', teacherId, scope: repos.teacher(teacherId), repos };
  }, [repos, session.state, teacherId]);
}
