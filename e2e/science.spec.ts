import { expect, test } from '@playwright/test';

const T = {
  en: { teacher: /I’m a teacher/, phone: 'Mobile number', send: 'Send code', code: '6-digit code', verify: 'Verify', name: /Your name/, school: /School name/, cont: 'Continue', create: 'Create class', demoNames: 'Use 30 demo names', gotIt: 'Got it', science: 'Science', chapter: 'Heat and acids', five: '5 questions selected' },
  hi: { teacher: /मैं टीचर हूँ/, phone: 'मोबाइल नंबर', send: 'कोड भेजें', code: '6 अंकों का कोड', verify: 'पक्का करें', name: /आपका नाम/, school: /स्कूल का नाम/, cont: 'आगे बढ़ें', create: 'क्लास बनाएँ', demoNames: '30 डेमो नाम लें', gotIt: 'समझ गए', science: 'विज्ञान', chapter: 'ऊष्मा और अम्ल', five: '5 सवाल चुने' },
};

test('a Class 7 Science teacher gets a Science chapter with five suggested questions', async ({ page }, info) => {
  const L = info.project.name.startsWith('hi') ? T.hi : T.en;
  await page.goto('/');
  await page.getByRole('link', { name: L.teacher }).click();
  await page.getByRole('textbox', { name: L.phone }).fill('9876543210');
  await page.getByRole('button', { name: L.send }).click();
  await page.getByRole('textbox', { name: L.code }).fill('123456');
  await page.getByRole('button', { name: L.verify }).click();
  await page.getByRole('textbox', { name: L.name }).fill('Asha');
  await page.getByRole('textbox', { name: L.school }).fill('Sunrise School');
  await page.getByRole('button', { name: L.cont }).click();
  await page.getByText('7', { exact: true }).first().click();
  await page.getByText(L.science, { exact: true }).click();
  await page.getByText('English', { exact: true }).last().click();
  await page.getByRole('button', { name: L.create }).click();
  await page.getByRole('button', { name: L.demoNames }).click();
  await page.getByRole('button', { name: L.cont }).click();
  await page.getByRole('button', { name: L.gotIt }).click();
  await page.waitForURL('**/t/create?mission=1');
  await expect(page.getByText(L.chapter).first()).toBeVisible();
  await expect(page.getByText(L.five)).toBeVisible();
});
