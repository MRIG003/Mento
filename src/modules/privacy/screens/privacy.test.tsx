import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createLocalRepositories, createMemoryDrivers, RepositoriesProvider } from '@/modules/data';
import { seededRandom } from '@/modules/domain';
import { I18nProvider } from '@/modules/foundation';
import { createPreviewServices, ServicesProvider } from '@/modules/services';
import { ClassScreen } from './ClassScreen';
import { WhatWeKeep } from './WhatWeKeep';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/t/class' }));
const clock = { now: () => new Date('2026-11-03T15:00:00.000Z') };

async function setup() {
  const repos = createLocalRepositories({ driver: createMemoryDrivers(1)[0]!, blobs: null, clock, rng: seededRandom(1) });
  await repos.session.useDemoTeacher();
  render(<I18nProvider><RepositoriesProvider repositories={repos}><ServicesProvider services={createPreviewServices({ clock, rng: seededRandom(2) })}><ClassScreen /></ServicesProvider></RepositoriesProvider></I18nProvider>);
  return { repos, user: userEvent.setup() };
}

describe('ClassScreen', () => {
  it('shows each child with consent status and lets the teacher record and withdraw it', async () => {
    const { user } = await setup();
    const rowOf = () => screen.getByText('Aisha').closest('li') as HTMLElement;
    await screen.findByText('Aisha');
    const status = () => within(rowOf()).getByText(/^(consent given|no consent yet)$/).textContent;
    const before = status();
    await user.click(within(rowOf()).getByRole('button', { name: /^(Record|Withdraw) consent$/ }));
    await vi.waitFor(() => expect(status()).not.toBe(before));
    await user.click(within(rowOf()).getByRole('button', { name: /^(Record|Withdraw) consent$/ }));
    await vi.waitFor(() => expect(status()).toBe(before));
  });

  it('deleting a child needs the typed word, then removes them', async () => {
    const { user, repos } = await setup();
    await user.click(await screen.findByRole('button', { name: 'Delete Dev' }));
    const sheet = await screen.findByRole('dialog', { name: 'Delete Dev?' });
    const confirm = within(sheet).getByRole('button', { name: 'Delete for good' });
    expect(confirm).toBeDisabled();
    await user.type(within(sheet).getByRole('textbox', { name: 'DELETE' }), 'delete');
    expect(confirm).toBeEnabled();
    await user.click(confirm);
    await vi.waitFor(() => { const d = repos.database.read(); expect(d.ok && d.value?.students.some((s) => s.firstName === 'Dev' && s.classId === 'cls_6b')).toBe(false); });
  });

  it('applies the text-size setting to the whole page', async () => {
    const { user } = await setup();
    await user.click(await screen.findByRole('radio', { name: 'Largest' }));
    expect(document.documentElement.style.fontSize).toBe('130%');
    await user.click(screen.getByRole('radio', { name: 'Normal' }));
    expect(document.documentElement.style.fontSize).toBe('');
  });

  it('offers the class data download and the wipe-everything option with a warning', async () => {
    await setup();
    expect(await screen.findByRole('button', { name: 'Download class data (CSV)' })).toBeInTheDocument();
    expect(screen.getAllByText(/Removes every class, child, answer and photo/).length).toBeGreaterThan(0);
  });
});

describe('WhatWeKeep', () => {
  it('says what, where, why and how long in plain words, in Hindi too, with the not-legal-advice note', async () => {
    localStorage.setItem('mento:prefs', JSON.stringify({ lang: 'hi' }));
    render(<I18nProvider><WhatWeKeep /></I18nProvider>);
    expect(await screen.findByText('बच्चे का पहला नाम')).toBeInTheDocument();
    expect(screen.getAllByText('सिर्फ़ इस फ़ोन में, इसी ब्राउज़र में।').length).toBeGreaterThan(0);
    expect(screen.getByText(/कानूनी सलाह नहीं/)).toBeInTheDocument();
  });
});
