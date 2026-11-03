import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createLocalRepositories, createMemoryDrivers, RepositoriesProvider, type Repositories } from '@/modules/data';
import { seededRandom } from '@/modules/domain';
import { I18nProvider } from '@/modules/foundation';
import { Desk } from './Desk';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/t' }));
const clock = { now: () => new Date('2026-11-03T15:00:00.000Z') };
const make = () => createLocalRepositories({ driver: createMemoryDrivers(1)[0]!, blobs: null, clock, rng: seededRandom(1) });
const renderDesk = (repos: Repositories) => render(<I18nProvider><RepositoriesProvider repositories={repos}><Desk /></RepositoriesProvider></I18nProvider>);

describe('Desk', () => {
  it('points a signed-out visitor to setup instead of showing an empty desk', async () => {
    renderDesk(make());
    expect(await screen.findByText('Set up Mento first')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Set up as a teacher' })).toHaveAttribute('href', '/start/teacher');
  });

  it('for the demo teacher: a homework note, the Demo data badge and the checklist with real progress', async () => {
    const repos = make();
    await repos.session.useDemoTeacher();
    renderDesk(repos);
    expect(await screen.findByText('Fractions · 32 of 40 in')).toBeInTheDocument();
    expect(screen.getByText('Demo data')).toBeInTheDocument();
    expect(screen.getByText('2 of 5 done')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See results' })).toHaveAttribute('href', '/t/results?hw=hw_6b_fractions');
  });

  it('a new teacher with a class but no homework sees the empty desk and the next action', async () => {
    const repos = make();
    const t = await repos.session.startTeacher({ name: 'Asha', schoolName: 'Sunrise' });
    if (!t.ok) throw new Error();
    await repos.teacher(t.value.id).createClass({ grade: 5, section: 'A', subjectId: 'maths' as never, defaultLang: 'hi' });
    renderDesk(repos);
    expect(await screen.findByText('Desk is clear.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create homework' })).toHaveAttribute('href', '/t/create');
    expect(screen.getByText('1 of 5 done')).toBeInTheDocument();
  });

  it('hides the checklist when all five steps are done', async () => {
    const { StarterChecklist } = await import('../components/StarterChecklist');
    const all = { createClass: true, shareJoin: true, publishHomework: true, seeInsight: true, sendPractice: true };
    const { container } = render(<I18nProvider><StarterChecklist checklist={all} /></I18nProvider>);
    expect(container).toBeEmptyDOMElement();
  });
});
