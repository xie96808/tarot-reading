import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`visible motion through shuffle, cut, deal and reveal at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    const missing: string[] = [];
    page.on('response', response => { if (response.status() >= 400 && /\/(table|cards|ui)\//.test(response.url())) missing.push(response.url()); });
    await page.goto('/read');
    for (const name of ['我准备好了', '这次不设问题', '开始洗牌']) await page.getByRole('button', { name, exact: true }).click();
    const scene = page.locator('[data-table-scene="play"]');
    const card = page.locator('[data-shuffle-card]').last();
    await expect(card).toBeVisible();
    await expect(page.locator('[data-shuffle-card]')).toHaveCount(16);
    await page.keyboard.down('Space');
    await expect(page.locator('[data-shuffle-phase]')).toHaveAttribute('data-shuffle-phase', 'holding');
    const before = await card.evaluate(el => getComputedStyle(el).transform);
    await page.waitForTimeout(250);
    const after = await card.evaluate(el => getComputedStyle(el).transform);
    expect(before).not.toBe('none');
    expect(after).not.toBe(before);
    await scene.screenshot({ path: testInfo.outputPath('shuffle.png') });
    await page.keyboard.up('Space');
    await page.getByRole('button', { name: '让牌落在桌上' }).waitFor({ timeout: 15000 });
    const packet = page.locator('[data-cut-packet]').first();
    const cutBefore = await packet.evaluate(el => getComputedStyle(el).transform);
    await page.getByRole('slider').focus();
    await page.keyboard.press('End');
    await expect(page.locator('[data-cut-index]')).toHaveAttribute('data-cut-index', '77');
    await page.waitForTimeout(500);
    expect(await packet.evaluate(el => getComputedStyle(el).transform)).not.toBe(cutBefore);
    await scene.screenshot({ path: testInfo.outputPath('cut.png') });
    await page.getByRole('button', { name: '让牌落在桌上' }).click();
    await expect(page.locator('[data-gathering="true"]')).toBeVisible();
    const flying = page.locator('[data-deal-card]:visible').first();
    await expect(flying).toBeVisible();
    const origin = await flying.evaluate(el => ({ x: el.style.getPropertyValue('--deal-x'), y: el.style.getPropertyValue('--deal-y'), animations: el.getAnimations().length }));
    expect(origin.x).not.toBe(''); expect(origin.y).not.toBe(''); expect(origin.animations).toBeGreaterThan(0);
    const next = page.locator('main').getByRole('button', { name: '翻开这一张' }).last();
    await next.waitFor();
    await next.click();
    await expect(page.locator('[data-card-visual]:visible [class*="inner"][class*="revealed"]').first()).toBeVisible();
    await page.waitForTimeout(750);
    await page.locator('[data-table-scene="spread"]').screenshot({ path: testInfo.outputPath('reveal.png') });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(missing).toEqual([]);
  });
}

test('reduced motion has no animated deck and missing manifest can be retried', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/cards/rws-1/manifest.json', route => route.fulfill({ status:503, body:'unavailable' }));
  await page.goto('/read');
  await expect(page.getByRole('button', { name:'重新加载牌面' })).toBeVisible();
  await page.unroute('**/cards/rws-1/manifest.json');
  const loaded = page.waitForResponse(response => response.url().endsWith('/cards/rws-1/manifest.json') && response.status() === 200);
  await page.getByRole('button', { name:'重新加载牌面' }).click();
  await loaded;
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
  for (const name of ['我准备好了', '这次不设问题', '开始洗牌']) await page.getByRole('button', { name, exact: true }).click();
  expect(await page.locator('[data-shuffle-card]').first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.getByRole('button', { name: '为我洗牌' }).click();
  await page.getByRole('button', { name: '让牌落在桌上' }).click();
  await expect(page.locator('main').getByRole('button', { name: '翻开这一张' }).last()).toBeVisible();
});

test('background WebP failure falls back to JPEG without hiding the deck', async ({ page }) => {
  await page.route('**/table/wood-v3.webp', route => route.abort());
  await page.goto('/read');
  for (const name of ['我准备好了', '这次不设问题', '开始洗牌']) await page.getByRole('button', { name, exact: true }).click();
  const background = page.locator('[data-table-background]');
  await expect.poll(() => background.evaluate((image: HTMLImageElement) => image.currentSrc)).toMatch(/wood-v3.jpg$/);
  await expect.poll(() => background.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(1600);
  await expect(page.locator('[data-shuffle-card]').first()).toBeVisible();
});

test('every newly revealed mobile position gets its own flip', async ({ page }) => {
  await page.setViewportSize({ width:390, height:1000 });
  await page.goto('/read');
  for (const name of ['我准备好了', '这次不设问题', '开始洗牌', '为我洗牌', '让牌落在桌上']) await page.getByRole('button', { name, exact:true }).click({timeout:15000});
  for (let i = 0; i < 3; i++) {
    await page.locator('main').getByRole('button', { name:'翻开这一张', exact:true }).last().click();
    const inner = page.locator('[data-card-visual]:visible [class*="inner"]').first();
    await expect.poll(() => inner.evaluate(el => el.getAnimations().some(animation => animation.playState === 'running'))).toBe(true);
    await page.waitForTimeout(700);
    await expect(inner).toHaveClass(/revealed/);
  }
});
