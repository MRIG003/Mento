import { expect, test } from '@playwright/test';

test.use({ launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] }, permissions: ['camera'] });

test('photo question: teacher adds it, a child captures it with the camera, the photo is EXIF-free and the teacher can review it', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(e.message));

  // Teacher: demo class → Create → own notebook-photo question → publish.
  await page.goto('/');
  await page.getByRole('button', { name: /Try with a demo class|डेमो क्लास के साथ आज़माएँ/ }).click();
  await page.waitForURL('**/t');
  await page.goto('/t/create');
  await page.getByRole('button', { name: /Write my own question|अपना सवाल लिखें/ }).click();
  const sheet = page.getByRole('dialog');
  await sheet.getByRole('radio', { name: /Notebook photo|कॉपी की फ़ोटो/ }).check({ force: true });
  await sheet.getByRole('textbox').first().fill('Show your working for 3/4 + 1/8');
  await sheet.getByRole('button', { name: /Add to homework|होमवर्क में जोड़ें/ }).click();
  await page.getByRole('button', { name: /Publish and share|भेजें और शेयर करें/ }).click();
  const url = (await page.getByTestId('share-url').textContent()) ?? '';
  const link = new URL(url);

  // Child (same browser): open the link as English, pick Anaya, answer until the photo question.
  await page.goto(link.pathname + link.hash);
  await page.getByRole('button', { name: 'Anaya', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, that’s me' }).click();
  const consent = page.getByRole('button', { name: 'Okay, start' });
  if (await consent.isVisible({ timeout: 1500 }).catch(() => false)) await consent.click();
  await page.getByRole('button', { name: /^(Start|Continue)$/ }).click();
  for (let i = 0; i < 8; i += 1) {
    if (await page.getByRole('button', { name: 'Photograph your page' }).count()) break;
    const radio = page.locator('input[type="radio"]').first();
    if (await radio.count()) await radio.check({ force: true });
    else await page.locator('input:not([type])').first().fill('1');
    await page.getByRole('button', { name: 'Next' }).click();
  }
  await page.getByRole('button', { name: 'Photograph your page' }).click();
  await page.getByRole('button', { name: 'Start camera' }).click();
  await expect(page.getByRole('status').filter({ hasText: /./ }).first()).toBeVisible();
  // Auto-capture may already have taken the photo (sharp, steady, framed); otherwise use the manual shutter.
  const shutter = page.getByRole('button', { name: 'Take photo' });
  if (await shutter.isVisible({ timeout: 2500 }).catch(() => false)) await shutter.click().catch(() => undefined);
  await expect(page.getByRole('button', { name: 'Use this photo' })).toBeVisible();

  // All camera tracks stop once the photo is taken.
  const live = await page.evaluate(() => [...document.querySelectorAll('video')].filter((v) => v.srcObject && (v.srcObject as MediaStream).getTracks().some((t) => t.readyState === 'live')).length);
  expect(live).toBe(0);

  await page.getByRole('button', { name: 'Use this photo' }).click();
  await expect(page.getByText('Photo saved on this phone.')).toBeVisible();

  // Stored photo is a JPEG without an EXIF (APP1) block.
  const header = await page.evaluate(() => new Promise<number[]>((resolve, reject) => {
    const open = indexedDB.open('mento-blobs', 1);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const req = open.result.transaction('blobs').objectStore('blobs').getAll();
      req.onsuccess = () => { const last = req.result[req.result.length - 1] as { bytes: ArrayBuffer }; resolve([...new Uint8Array(last.bytes).slice(0, 64)]); };
    };
  }));
  expect(header.slice(0, 3)).toEqual([0xff, 0xd8, 0xff]);
  for (let i = 0; i < header.length - 1; i += 1) expect(header[i] === 0xff && header[i + 1] === 0xe1).toBe(false);

  await page.getByRole('button', { name: 'Check and submit' }).click();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText(/Done! Your teacher will see it/)).toBeVisible();

  // Teacher: Review shows the photo and the Preview suggestion.
  await page.goto('/t/results');
  await page.getByRole('tab', { name: /^(Review|जाँच)/ }).click();
  await expect(page.getByRole('img', { name: /Notebook photo from Anaya|Anaya की कॉपी की फ़ोटो/ })).toBeVisible();
  await expect(page.getByText(/Reading suggestion|पढ़ने का सुझाव/)).toBeVisible();
  expect(problems, problems.join('\n')).toEqual([]);
});
