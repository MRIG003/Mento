import { expect, test } from '@playwright/test';

const T = {
  en: { teacher: /I’m a teacher/, phone: 'Mobile number', send: 'Send code', code: '6-digit code', verify: 'Verify', name: /Your name/, school: /School name/, cont: 'Continue', create: 'Create class', demoNames: 'Use 30 demo names', gotIt: 'Got it', progress: '1 of 5 done', step3: 'Step 3 of 7' },
  hi: { teacher: /मैं टीचर हूँ/, phone: 'मोबाइल नंबर', send: 'कोड भेजें', code: '6 अंकों का कोड', verify: 'पक्का करें', name: /आपका नाम/, school: /स्कूल का नाम/, cont: 'आगे बढ़ें', create: 'क्लास बनाएँ', demoNames: '30 डेमो नाम लें', gotIt: 'समझ गए', progress: '5 में से 1 पूरे', step3: 'चरण 3 / 7' },
};

test('a new teacher goes from the role chooser through setup to the mission, and the desk shows the checklist', async ({ page }, info) => {
  const L = info.project.name.startsWith('hi') ? T.hi : T.en;
  const problems: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });

  await page.goto('/');
  await page.getByRole('link', { name: L.teacher }).click();
  await page.getByRole('textbox', { name: L.phone }).fill('9876543210');
  await page.getByRole('button', { name: L.send }).click();
  await page.getByRole('textbox', { name: L.code }).fill('123456');
  await page.getByRole('button', { name: L.verify }).click();
  await page.getByRole('textbox', { name: L.name }).fill('Asha');
  await page.getByRole('textbox', { name: L.school }).fill('Sunrise School');
  await page.getByRole('button', { name: L.cont }).click();
  await expect(page.getByText(L.step3)).toBeVisible();
  await page.getByText('हिन्दी', { exact: true }).last().click();
  await page.getByRole('button', { name: L.create }).click();
  await page.getByRole('button', { name: L.demoNames }).click();
  await page.getByRole('button', { name: L.cont }).click();
  await page.getByRole('button', { name: L.gotIt }).click();
  await page.waitForURL('**/t/create?mission=1');

  await page.goto('/t');
  await expect(page.getByText(L.progress)).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(4);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
  expect(problems, problems.join('\n')).toEqual([]);
});
