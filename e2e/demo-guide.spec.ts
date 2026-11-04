import { expect, test } from '@playwright/test';

test('demo desk: Evening Wrap is computed, the presenter guide opens with the button and the ? key, and Reset demo works', async ({ page }, info) => {
  const hi = info.project.name.startsWith('hi');
  const problems: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });

  await page.goto('/');
  await page.getByRole('button', { name: hi ? 'डेमो क्लास के साथ आज़माएँ' : 'Try with a demo class' }).click();
  await page.waitForURL('**/t');
  await expect(page.getByText(hi ? /कल की शुरुआत भिन्नों की तुलना से करें। 6 बच्चों को इसकी ज़रूरत है।/ : 'Tomorrow, start with Comparing fractions. 6 children need it.')).toBeVisible();

  await page.getByRole('button', { name: hi ? 'डेमो गाइड' : 'Demo guide' }).click();
  await expect(page.getByRole('dialog', { name: hi ? 'डेमो गाइड' : 'Demo guide' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.keyboard.press('?');
  await expect(page.getByRole('dialog', { name: hi ? 'डेमो गाइड' : 'Demo guide' })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: hi ? 'डेमो रीसेट करें' : 'Reset demo' }).click();
  await expect(page.getByText(hi ? /कल की शुरुआत भिन्नों की तुलना से करें/ : /Tomorrow, start with Comparing fractions/)).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
  expect(problems, problems.join('\n')).toEqual([]);
});
