import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createLocalRepositories, createMemoryDrivers, RepositoriesProvider } from '@/modules/data';
import { seededRandom } from '@/modules/domain';
import { I18nProvider } from '@/modules/foundation';
import { createPreviewServices, ServicesProvider } from '@/modules/services';
import { TeacherStart } from './TeacherStart';

const replace = vi.fn();
const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace }), usePathname: () => '/start/teacher' }));

const clock = { now: () => new Date('2026-11-03T15:00:00.000Z') };
function renderStart() {
  const repos = createLocalRepositories({ driver: createMemoryDrivers(1)[0]!, blobs: null, clock, rng: seededRandom(1) });
  const services = createPreviewServices({ clock, rng: seededRandom(2), clipboard: { writeText: async () => {} } });
  render(<I18nProvider><RepositoriesProvider repositories={repos}><ServicesProvider services={services}><TeacherStart /></ServicesProvider></RepositoriesProvider></I18nProvider>);
  return repos;
}

describe('TeacherStart', () => {
  it('walks a new teacher from OTP (Preview) to the first-homework mission', async () => {
    const user = userEvent.setup();
    const repos = renderStart();

    expect(await screen.findByText('Step 1 of 7')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Mobile number' }), '98765 43210');
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    expect(screen.getByText('Preview: no SMS is sent. Use the code 123456.')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: '6-digit code' }), '123456');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    expect(await screen.findByText('Step 2 of 7')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getAllByText('Please fill this in.')).toHaveLength(2);
    await user.type(screen.getByRole('textbox', { name: /Your name/ }), 'Asha');
    await user.type(screen.getByRole('textbox', { name: /School name/ }), 'Sunrise School');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Step 3 of 7')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create class' })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'हिन्दी' }));
    await user.click(screen.getByRole('button', { name: 'Create class' }));

    expect(await screen.findByText('Step 4 of 7')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Use 30 demo names' }));
    expect(await screen.findByText('30 children in this class')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Share on WhatsApp' }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/\?text=/);
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Step 5 of 7')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Got it' }));
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/t/create?mission=1'));

    const session = await repos.session.get();
    expect(session.ok && session.value.role).toBe('teacher');
  });

  it('offers a way out to the demo class at every step', async () => {
    const user = userEvent.setup();
    renderStart();
    await user.click(await screen.findByRole('button', { name: 'Skip setup and try a demo class' }));
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith('/t'));
  });
});
