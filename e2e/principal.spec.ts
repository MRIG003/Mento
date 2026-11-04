import { expect, test } from '@playwright/test';

const L = {
  en: { principal: /I’m a principal/, join: 'Join', go: 'See the school overview', headline: /Class 5A Hindi is the biggest gap this term/, locked: 'Unlocks when 3 teachers are active', gaps: 'Gaps', code: 'School code' },
  hi: { principal: /मैं प्रिंसिपल हूँ/, join: 'जुड़ें', go: 'स्कूल की झलक देखें', headline: /इस टर्म में कक्षा 5A हिन्दी में सबसे बड़ी कमी है/, locked: '3 टीचर ऐक्टिव होने पर खुलेगा', gaps: 'कमियाँ', code: 'स्कूल कोड' },
};

test('principal: demo school code, aggregates-only overview, and a clear lock explanation', async ({ page }, info) => {
  const t = info.project.name.startsWith('hi') ? L.hi : L.en;
  const problems: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });

  await page.goto('/');
  await page.getByRole('link', { name: t.principal }).click();
  await page.getByRole('textbox', { name: t.code }).fill('demo26');
  await page.getByRole('button', { name: t.join }).click();
  await page.getByRole('button', { name: t.go }).click();
  await expect(page.getByText(t.headline)).toBeVisible();

  const body = await page.locator('main').innerText();
  for (const banned of ['Anaya', 'Meera', 'Ravi', 'Farah']) expect(body).not.toContain(banned);

  await page.getByRole('navigation').getByRole('link', { name: t.gaps }).click();
  await expect(page.getByText(t.locked).first()).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
  expect(problems, problems.join('\n')).toEqual([]);
});
