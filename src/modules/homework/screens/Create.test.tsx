import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createLocalRepositories, createMemoryDrivers, RepositoriesProvider } from '@/modules/data';
import { seededRandom } from '@/modules/domain';
import { I18nProvider } from '@/modules/foundation';
import { createPreviewServices, ServicesProvider } from '@/modules/services';
import { Create } from './Create';

let search = new URLSearchParams();
vi.mock('next/navigation', () => ({ useSearchParams: () => search, useRouter: () => ({ push: vi.fn() }), usePathname: () => '/t/create' }));

const clock = { now: () => new Date() };
async function renderCreate(query = '') {
  search = new URLSearchParams(query);
  const repos = createLocalRepositories({ driver: createMemoryDrivers(1)[0]!, blobs: null, clock, rng: seededRandom(1) });
  await repos.session.useDemoTeacher();
  const services = createPreviewServices({ clock, rng: seededRandom(2) });
  render(<I18nProvider><RepositoriesProvider repositories={repos}><ServicesProvider services={services}><Create /></ServicesProvider></RepositoriesProvider></I18nProvider>);
  return repos;
}

describe('Create homework', () => {
  it('preselects 5 suggested questions for the first chapter', async () => {
    await renderCreate();
    expect(await screen.findByText('5 questions selected')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox', { checked: true })).toHaveLength(5);
    expect(screen.getAllByRole('checkbox')).toHaveLength(5); // collapsed to the selection
    expect(screen.getByRole('radio', { name: 'Fractions' })).toBeChecked();
  });

  it('can expand to every question in the chapter and add one', async () => {
    const user = userEvent.setup();
    await renderCreate();
    await user.click(await screen.findByRole('button', { name: /Show all 23 questions/ }));
    expect(screen.getAllByRole('checkbox').length).toBe(23);
    await user.click(screen.getAllByRole('checkbox', { checked: false })[0]!);
    expect(screen.getByText('6 questions selected')).toBeInTheDocument();
  });

  it('explains why publish is disabled when no question is picked', async () => {
    const user = userEvent.setup();
    await renderCreate();
    await screen.findByText('5 questions selected');
    for (const box of screen.getAllByRole('checkbox', { checked: true })) await user.click(box);
    expect(screen.getByRole('button', { name: 'Publish and share' })).toBeDisabled();
    expect(screen.getByText('Pick at least one question to publish.')).toBeInTheDocument();
  });

  it('publishes and opens the share sheet with a wa.me link and a fragment-token homework URL', async () => {
    const user = userEvent.setup();
    const repos = await renderCreate();
    await screen.findByText('5 questions selected');
    await user.click(screen.getByRole('button', { name: 'Publish and share' }));
    const sheet = await screen.findByRole('dialog', { name: 'Homework is ready' });
    expect(within(sheet).getByTestId('share-url').textContent).toMatch(/\/h#k=[A-Za-z0-9_-]{22}&lang=en$/);
    const wa = within(sheet).getByRole('link', { name: 'Share on WhatsApp' }).getAttribute('href') ?? '';
    expect(wa.startsWith('https://wa.me/?text=')).toBe(true);
    expect(decodeURIComponent(wa)).toContain('Class 6B Maths homework: Fractions.');
    const list = await repos.teacher('t_demo' as never).listHomework();
    expect(list.ok && list.value.filter((h) => h.status === 'published')).toHaveLength(2); // seeded 6B Fractions + this one
  });

  it('shows the first-homework mission note', async () => {
    await renderCreate('mission=1');
    expect(await screen.findByText(/Your first homework/)).toBeInTheDocument();
  });
});
