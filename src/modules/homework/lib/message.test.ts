import { describe, expect, it } from 'vitest';
import { homeworkMessage, homeworkUrl } from './message';

const base = { classLabel: '6B', subject: { en: 'Maths', hi: 'गणित' }, chapter: { en: 'Fractions', hi: 'भिन्न' }, dueAt: '2026-11-04T14:30:00.000Z' };

describe('homework message', () => {
  it('is written in the homework language, with class, subject, chapter, due and link only', () => {
    const url = homeworkUrl('https://mento.example', 'AbCdEfGhIjKlMnOpQrSt_-', 'hi');
    const hi = homeworkMessage({ ...base, lang: 'hi', url });
    expect(hi).toContain('कक्षा 6B गणित का होमवर्क: भिन्न');
    expect(hi).toContain('https://mento.example/h#k=AbCdEfGhIjKlMnOpQrSt_-&lang=hi');
    const en = homeworkMessage({ ...base, lang: 'en', url });
    expect(en).toMatch(/^Class 6B Maths homework: Fractions\. Please finish by .+\. Open: https:/);
  });
  it('puts the token in the fragment, not the path or query', () => {
    expect(homeworkUrl('https://x', 'AbCdEfGhIjKlMnOpQrSt_-', 'en')).toBe('https://x/h#k=AbCdEfGhIjKlMnOpQrSt_-&lang=en');
  });
});
