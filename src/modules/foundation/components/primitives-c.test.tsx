import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '../i18n/provider';
import { CoachMarks, type CoachSteps } from './CoachMarks';
import { Field, inputClass } from './Field';
import { Sheet } from './Sheet';

const wrap = (ui: ReactNode) => render(<I18nProvider>{ui}</I18nProvider>);

function SheetHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>{'Share'}</button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Share homework"><p>{'link'}</p></Sheet>
    </>
  );
}

describe('Sheet', () => {
  it('opens as a titled dialog, closes on Esc and returns focus to the opener', async () => {
    const user = userEvent.setup();
    wrap(<SheetHarness />);
    const opener = await screen.findByRole('button', { name: 'Share' });
    await user.click(opener);
    const dialog = screen.getByRole('dialog', { name: 'Share homework' });
    expect(dialog).toHaveAttribute('open');

    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(dialog).not.toHaveAttribute('open');
    expect(opener).toHaveFocus();
  });

  it('closes with the Close button', async () => {
    const user = userEvent.setup();
    wrap(<SheetHarness />);
    await user.click(await screen.findByRole('button', { name: 'Share' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open');
  });
});

describe('CoachMarks', () => {
  const steps: CoachSteps = [
    { target: 'a', textKey: 'common.help' },
    { target: 'b', textKey: 'common.demoData' },
  ];

  it('walks through steps with a counter and reports completion', async () => {
    const onFinish = vi.fn();
    const user = userEvent.setup();
    wrap(<><div data-coach="a" /><CoachMarks steps={steps} open onFinish={onFinish} /></>);
    expect(await screen.findByText('1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('2 of 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onFinish).toHaveBeenCalledWith(false);
  });

  it('can be skipped at any step', async () => {
    const onFinish = vi.fn();
    const user = userEvent.setup();
    wrap(<CoachMarks steps={steps} open onFinish={onFinish} />);
    await user.click(await screen.findByRole('button', { name: 'Skip tour' }));
    expect(onFinish).toHaveBeenCalledWith(true);
  });

  it('allows at most four steps per screen (compile-time)', () => {
    const s = { target: 'x', textKey: 'common.help' } as const;
    // @ts-expect-error five coach marks on one screen is not allowed
    const tooMany: CoachSteps = [s, s, s, s, s];
    expect(tooMany).toHaveLength(5);
  });
});

describe('Field', () => {
  it('links label, hint and error to the control', async () => {
    wrap(
      <Field label="Class name" hint="For example 6B" error="Please type a class name" required>
        {(control) => <input className={inputClass} {...control} />}
      </Field>,
    );
    const input = await screen.findByRole('textbox', { name: /Class name/ });
    expect(input).toHaveAccessibleDescription('For example 6B Please type a class name');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Please type a class name');
  });

  it('has no error wiring when valid', async () => {
    wrap(<Field label="Name">{(control) => <input {...control} />}</Field>);
    const input = await screen.findByRole('textbox', { name: 'Name' });
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });
});
