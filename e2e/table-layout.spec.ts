import { expect, test, type Page } from '@playwright/test';

async function enter(page: Page, celtic = false) {
  await page.goto('/read');
  await page.getByRole('button', { name: '我准备好了' }).click();
  await page.getByRole('button', { name: '这次不设问题' }).click();
  if (celtic) await page.getByRole('button', { name: /处境之镜/ }).click();
  await page.getByRole('button', { name: '开始洗牌' }).click();
}

for (const width of [375, 390, 719, 720, 721, 768, 1023, 1024, 1440]) {
  test(`table geometry and visible three-card reading at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await enter(page);
    const photo = page.locator('[data-table-scene="play"]');
    const box = await photo.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(380);
    await expect.poll(() => photo.locator('[data-table-background]').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1600);
    expect(await photo.locator('[data-table-background]').evaluate((img) => getComputedStyle(img).transform)).toBe('none');
    await page.getByRole('button', { name: '为我洗牌' }).click();
    await expect(page.getByRole('button', { name: '让牌落在桌上' })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-cut-packet]')).toHaveCount(2);
    await expect(page.locator('[data-cut-packet]').first()).toBeVisible();
    await page.getByRole('button', { name: '让牌落在桌上' }).click();
    const next = page.locator('main').getByRole('button', { name: '翻开这一张' }).last();
    await expect(next).toBeVisible({ timeout: 10000 });
    const scene = page.locator('[data-table-scene="spread"]');
    const cards = scene.locator('img:visible');
    // One background plus at least one interactive card, not an empty felt.
    expect(await cards.count()).toBeGreaterThan(1);
    const bounds = await scene.boundingBox();
    for (const card of await cards.all()) {
      const rect = await card.boundingBox();
      expect(rect!.x).toBeGreaterThanOrEqual(bounds!.x - 1);
      expect(rect!.x + rect!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
      expect(rect!.y).toBeGreaterThanOrEqual(bounds!.y - 1);
      expect(rect!.y + rect!.height).toBeLessThanOrEqual(bounds!.y + bounds!.height + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await scene.screenshot({ path: testInfo.outputPath(`table-${width}.png`) });
    await next.click(); await next.click(); await next.click();
    await expect(page.getByRole('heading', { name: '整阵线索' })).toBeVisible();
  });
}

test('reduced motion, missing decorations, and enlarged reading text keep the reading usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/ui/**', (route) => route.abort());
  await page.route('**/share/parchment-strip.jpg', (route) => route.abort());
  await enter(page, true);
  await expect(page.locator('[data-table-scene="play"]')).toHaveAttribute('data-hand', 'none');
  await page.getByRole('button', { name: '为我洗牌' }).click();
  await page.getByRole('button', { name: '让牌落在桌上' }).click({ timeout: 15000 });
  const next = page.locator('main').getByRole('button', { name: '翻开这一张' }).last();
  for (let i = 0; i < 10; i++) await next.click();
  await page.addStyleTag({ content: 'article p { font-size: 34px; }' });
  await expect(page.locator('article p').first()).toHaveCSS('font-size', '34px');
  await expect(page.getByRole('heading', { name: '当下核心' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: '书页阅读' })).toBeVisible();
});

test('pointer shuffle animates the deck without moving the table', async ({ page }) => {
  await enter(page);
  const scene = page.locator('[data-table-scene="play"]');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('section').filter({ has: scene }).evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
  });
  const box = (await scene.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(scene).toHaveAttribute('data-hand', 'riffle');
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.6, { steps: 12 });
  expect(await scene.boundingBox()).toEqual(box);
  await page.mouse.up();
  await expect(page.getByRole('button', { name: '让牌落在桌上' })).toBeVisible({ timeout: 15000 });
});

test('celtic right column controls do not overlap the next card', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await enter(page, true);
  await page.getByRole('button', { name: '为我洗牌' }).click();
  await page.getByRole('button', { name: '让牌落在桌上' }).click({ timeout: 15000 });
  await expect(page.locator('main').getByRole('button', { name: '翻开这一张' }).last()).toBeVisible({ timeout: 10000 });
  const items = page.locator('[data-table-scene="spread"] [role="listitem"]');
  const rects = [];
  for (const index of [9, 8, 7, 6]) rects.push((await items.nth(index).boundingBox())!);
  for (let i = 0; i < rects.length - 1; i++) expect(rects[i].y + rects[i].height).toBeLessThanOrEqual(rects[i + 1].y);
  await page.locator('[data-table-scene="spread"]').screenshot({ path: testInfo.outputPath('celtic-desktop.png') });
});
