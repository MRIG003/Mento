import { expect, test } from '@playwright/test';

const L = {
  en: { demo: 'Try with a demo class', headline: /6 students stuck on Comparing fractions/, publish: 'Publish and share', name: 'Anaya', yes: 'Yes, that’s me', ok: 'Okay, start', start: 'Start', next: 'Next', review: 'Check and submit', submit: 'Submit', done: /Done! Your teacher will see it/, give: /Give practice to these 6/, approve: 'Approve and share', practiceTab: 'Practice', startPractice: 'Start practice', desk: 'Desk', results: 'Results' },
  hi: { demo: 'डेमो क्लास के साथ आज़माएँ', headline: /6 बच्चे भिन्नों की तुलना में अटके हैं/, publish: 'भेजें और शेयर करें', name: 'Anaya', yes: 'हाँ, मैं ही हूँ', ok: 'ठीक है, शुरू करें', start: 'शुरू करें', next: 'आगे', review: 'देखें और जमा करें', submit: 'जमा करें', done: /हो गया! टीचर/, give: /इन 6 को प्रैक्टिस दें/, approve: 'मंज़ूर करें और शेयर करें', practiceTab: 'अभ्यास', startPractice: 'अभ्यास शुरू करें', desk: 'डेस्क', results: 'नतीजे' },
};

test('class demo: the 6B headline is computed, a child answers on the link, the teacher gives practice, the child sees it', async ({ page }, info) => {
  const t = info.project.name.startsWith('hi') ? L.hi : L.en;
  const problems: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(e.message));

  // Teacher: demo class → the flagship headline, computed from the seed by the real rules.
  await page.goto('/');
  await page.getByRole('button', { name: t.demo }).click();
  await page.waitForURL('**/t');
  await page.goto('/t/results');
  await expect(page.getByRole('heading', { name: t.headline })).toBeVisible();

  // Teacher: practice for the 6 stuck children (draft → approve).
  await page.getByRole('button', { name: t.give }).click();
  await page.getByRole('button', { name: t.approve }).click();
  const url = (await page.locator('dialog[open] .font-mono').textContent()) ?? '';
  expect(url).toMatch(/\/h#k=[A-Za-z0-9_-]{22}&lang=/);

  // Child (same browser, as in the demo): opens the link, picks Anaya, consents, sees Practice.
  await page.goto(new URL(url).pathname + new URL(url).hash);
  // The link carries the class language (English for 6B); a Hindi-speaking parent switches with one tap.
  if (info.project.name.startsWith('hi')) await page.locator('header button[lang="hi"]').click();
  await page.getByRole('button', { name: t.name, exact: true }).click();
  await page.getByRole('button', { name: t.yes }).click();
  // Consent is asked once per child; the demo seed already has it for Anaya.
  const consent = page.getByRole('button', { name: t.ok });
  if (await consent.isVisible({ timeout: 1500 }).catch(() => false)) await consent.click();
  await page.getByRole('button', { name: t.practiceTab }).click();
  await page.getByRole('button', { name: t.startPractice }).click();
  await page.getByRole('button', { name: t.start }).click();
  for (let i = 0; i < 5; i += 1) {
    const radio = page.locator('input[type="radio"]').first();
    if (await radio.count()) await radio.check({ force: true });
    else await page.locator('input:not([type])').first().fill('1');
    const last = page.getByRole('button', { name: t.review });
    if (await last.count()) { await last.click(); break; }
    await page.getByRole('button', { name: t.next }).click();
  }
  await page.getByRole('button', { name: t.submit }).click();
  await expect(page.getByText(t.done)).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
  expect(problems, problems.join('\n')).toEqual([]);
});
