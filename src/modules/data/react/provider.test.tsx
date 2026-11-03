import { act, render, screen } from '@testing-library/react';
import { useCallback } from 'react';
import { describe, expect, it } from 'vitest';
import { seededRandom, type HomeworkId, type StudentId } from '@/modules/domain';
import { createLocalRepositories, DEMO_TEACHER_ID, type Repositories } from '../repositories';
import { createMemoryDrivers } from '../storage/memory-driver';
import { RepositoriesProvider, useLive } from './provider';

const clock = { now: () => new Date('2026-11-03T15:00:00.000Z') };

function SubmittedCount() {
  const load = useCallback((r: Repositories) => r.teacher(DEMO_TEACHER_ID).getResults('hw_6b_fractions' as HomeworkId), []);
  const live = useLive(load);
  if (live.state === 'loading') return <p>{'loading'}</p>;
  if (live.state === 'error') return <p>{live.error.code}</p>;
  return <p>{`submitted ${live.data.submittedCount}`}</p>;
}

describe('useLive', () => {
  it('shows an error state instead of crashing when data is missing', async () => {
    const repos = createLocalRepositories({ driver: createMemoryDrivers(1)[0]!, blobs: null, clock, rng: seededRandom(1) });
    render(<RepositoriesProvider repositories={repos}><SubmittedCount /></RepositoriesProvider>);
    expect(await screen.findByText('NOT_FOUND')).toBeInTheDocument();
  });

  it('updates the teacher tab when a child submits in another tab (shared storage)', async () => {
    const [teacherDriver, studentDriver] = createMemoryDrivers(2);
    const teacherRepos = createLocalRepositories({ driver: teacherDriver!, blobs: null, clock, rng: seededRandom(1) });
    const studentRepos = createLocalRepositories({ driver: studentDriver!, blobs: null, clock, rng: seededRandom(2) });
    await teacherRepos.session.useDemoTeacher();

    render(<RepositoriesProvider repositories={teacherRepos}><SubmittedCount /></RepositoriesProvider>);
    expect(await screen.findByText('submitted 32')).toBeInTheDocument();

    const results = await teacherRepos.teacher(DEMO_TEACHER_ID).getResults('hw_6b_fractions' as HomeworkId);
    if (!results.ok) throw new Error();
    const pending = results.value.rows.find((r) => r.state === 'pending')!;
    const link = studentRepos.studentLink(results.value.homework.token);
    await act(async () => {
      await link.claim(pending.studentId as StudentId);
      await link.submit('hw_6b_fractions' as HomeworkId);
    });
    expect(await screen.findByText('submitted 33')).toBeInTheDocument();
  });
});
