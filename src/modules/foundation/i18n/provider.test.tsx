import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { I18nProvider, useI18n } from './provider';

function Probe() {
  const { t, lang, setLang } = useI18n();
  const [answer, setAnswer] = useState('');
  return (
    <div>
      <p>{t('common.demoData')}</p>
      <label>{t('common.loading')}<input value={answer} onChange={(e) => setAnswer(e.target.value)} /></label>
      <button type="button" onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}>{'toggle'}</button>
    </div>
  );
}

describe('I18nProvider', () => {
  it('switches language in place, keeping typed input, and updates html[lang] and the stored preference', async () => {
    const user = userEvent.setup();
    render(<I18nProvider><Probe /></I18nProvider>);
    expect(await screen.findByText('Demo data')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox'), '3/4');
    await user.click(screen.getByRole('button', { name: 'toggle' }));

    expect(screen.getByText('डेमो डेटा')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('3/4');
    expect(document.documentElement.lang).toBe('hi');
    expect(JSON.parse(localStorage.getItem('mento:prefs') ?? '{}')).toMatchObject({ lang: 'hi' });
  });

  it('starts in the language stored on this device', async () => {
    localStorage.setItem('mento:prefs', JSON.stringify({ lang: 'hi' }));
    render(<I18nProvider><Probe /></I18nProvider>);
    expect(await screen.findByText('डेमो डेटा')).toBeInTheDocument();
  });

  it('ignores a corrupt stored preference instead of crashing', async () => {
    localStorage.setItem('mento:prefs', '{not json');
    render(<I18nProvider><Probe /></I18nProvider>);
    expect(await screen.findByText('Demo data')).toBeInTheDocument();
  });
});

describe('I18nProvider with a shared link', () => {
  it('opens in the link language, then lets the parent switch while keeping the link token', async () => {
    localStorage.setItem('mento:prefs', JSON.stringify({ lang: 'en' }));
    window.history.replaceState(null, '', '/h#k=abc123&lang=hi');
    const user = userEvent.setup();
    render(<I18nProvider><Probe /></I18nProvider>);
    expect(await screen.findByText('डेमो डेटा')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'toggle' }));

    expect(screen.getByText('Demo data')).toBeInTheDocument();
    expect(window.location.hash).toBe('#k=abc123');
    expect(window.location.pathname).toBe('/h');
  });
});
