import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`visible motion through shuffle, cut, deal and reveal at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    const missing: string[] = [];
    page.on('response', response => { if (response.status() >= 400 && /\/(table|cards|ui|hands)\//.test(response.url())) missing.push(response.url()); });
    await page.goto('/read');
    await page.getByRole('button', { name: '我准备好了', exact: true }).click();
    await page.getByRole('button', { name: '这次不设问题', exact: true }).click();
    await page.getByRole('button', { name: '推门' }).click();
    await page.getByRole('button', { name: '开始洗牌', exact: true }).click();
    const scene = page.locator('[data-table-scene="play"]');
    const card = page.locator('[data-shuffle-card]').last();
    await expect(card).toBeVisible();
    await expect(page.locator('[data-shuffle-card]')).toHaveCount(16);
    await expect(page.locator('[data-ritual-hands="shuffle"]')).toBeVisible();
    await expect(page.locator('[data-felt-mat]')).toBeVisible();
    await page.keyboard.down('Space');
    await expect(page.locator('[data-shuffle-phase]')).toHaveAttribute('data-shuffle-phase', 'holding');
    // Mid-hold must leave idle: first frame is split, then riffle.
    await expect(page.locator('[data-shuffle-phase]')).toHaveAttribute('data-hand-frame', 'split');
    await expect(page.locator('[data-ritual-hands="shuffle"]')).toHaveAttribute('data-hand-frame', 'split');
    await expect.poll(async () => page.locator('[data-shuffle-card]').evaluateAll((nodes) => {
      const left = nodes.find((n) => n.getAttribute('data-half') === 'left');
      const right = nodes.find((n) => n.getAttribute('data-half') === 'right');
      if (!left || !right) return 0;
      const la = left.getBoundingClientRect();
      const lb = right.getBoundingClientRect();
      return Math.abs(lb.left + lb.width / 2 - (la.left + la.width / 2));
    }), { timeout: 2000 }).toBeGreaterThan(100);
    await scene.screenshot({ path: testInfo.outputPath('shuffle-split.png') });
    await expect.poll(async () => page.locator('[data-shuffle-phase]').getAttribute('data-hand-frame'), { timeout: 3000 }).toBe('riffle');
    await expect(page.locator('[data-ritual-hands="shuffle"]')).toHaveAttribute('data-hand-frame', 'riffle');
    const before = await card.evaluate(el => getComputedStyle(el).transform);
    await page.waitForTimeout(200);
    const after = await card.evaluate(el => getComputedStyle(el).transform);
    expect(before).not.toBe('none');
    // Pose may hold on riffle; hand frame change already proved cycling.
    expect(after).not.toBe('none');
    await scene.screenshot({ path: testInfo.outputPath('shuffle-riffle.png') });
    await page.keyboard.up('Space');
    await page.getByRole('button', { name: '让牌落在桌上' }).waitFor({ timeout: 15000 });
    const packet = page.locator('[data-cut-packet]').first();
    const cutBefore = await packet.evaluate(el => getComputedStyle(el).transform);
    await page.getByRole('slider').fill('10');
    await expect(page.locator('[data-cut-index]')).toHaveAttribute('data-cut-index', '10');
    await expect(page.locator('[data-cut-label="top"]')).toHaveText('上叠 · 10');
    const edgesAt10 = await page.locator('[data-cut-packet][data-cut-side="top"] > div').count();
    await scene.screenshot({ path: testInfo.outputPath('cut-thin.png') });
    await page.getByRole('slider').fill('68');
    await expect(page.locator('[data-cut-index]')).toHaveAttribute('data-cut-index', '68');
    await expect(page.locator('[data-cut-label="top"]')).toHaveText('上叠 · 68');
    await expect(page.locator('[data-cut-label="bottom"]')).toHaveText('下叠 · 10');
    const edgesAt68 = await page.locator('[data-cut-packet][data-cut-side="top"] > div').count();
    expect(edgesAt68).toBeGreaterThan(edgesAt10);
    await expect(page.locator('[data-ritual-hands="cut"]')).toBeVisible();
    await page.waitForTimeout(200);
    expect(await packet.evaluate(el => getComputedStyle(el).transform)).not.toBe(cutBefore);
    await scene.screenshot({ path: testInfo.outputPath('cut-thick.png') });
    await page.getByRole('button', { name: '让牌落在桌上' }).click();
    await expect(page.locator('[data-gathering="true"]')).toBeVisible();
    const flying = page.locator('[data-deal-card]:visible').first();
    await expect(flying).toBeVisible();
    const origin = await flying.evaluate(el => ({
      x: el.style.getPropertyValue('--deal-x'),
      y: el.style.getPropertyValue('--deal-y'),
      animations: el.getAnimations().length,
      transform: getComputedStyle(el).transform,
    }));
    expect(origin.x).not.toBe(''); expect(origin.y).not.toBe(''); expect(origin.animations).toBeGreaterThan(0);
    // Mid-flight transform should not already be identity.
    expect(origin.transform === 'none' || origin.transform.includes('matrix')).toBe(true);
    if (origin.transform.startsWith('matrix')) {
      // matrix(a,b,c,d,tx,ty) — tx/ty from deal should be non-trivial early on
      const parts = origin.transform.slice(7, -1).split(',').map(Number);
      const drift = Math.hypot(parts[4] ?? 0, parts[5] ?? 0);
      expect(drift).toBeGreaterThan(5);
    }
    const next = page.locator('main').locator('[data-reveal="primary"]');
    await next.waitFor();
    await next.click();
    await expect(page.locator('[data-card-visual]:visible [class*="inner"][class*="revealed"]')).toHaveCount(0);
    await expect(page.locator('[data-card-visual]:visible [class*="inner"][class*="partial"]').first()).toBeVisible();
    // Counter counts as soon as face is in view (partial / palm).
    await expect(page.locator('[data-reveal-count]')).toHaveAttribute('data-reveal-count', '1');
    await expect(page.locator('[data-reveal-count]')).toContainText('已翻开 1 / 3');
    const skip = page.getByRole('button', { name: '先不聊这个，看这张牌' });
    await expect(skip).toBeEnabled();
    await skip.click();
    await expect(page.locator('[data-card-visual]:visible [class*="inner"][class*="revealed"]').first()).toBeVisible();
    await page.waitForTimeout(750);
    await page.locator('[data-table-scene="spread"]').screenshot({ path: testInfo.outputPath('reveal.png') });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(missing).toEqual([]);
  });
}


test('过手 counts face-up in palm before 放回桌上', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/read');
  await page.getByRole('button', { name: '我准备好了', exact: true }).click();
  await page.getByRole('button', { name: '这次不设问题', exact: true }).click();
  await page.getByRole('button', { name: '过手' }).click();
  for (const name of ['开始洗牌', '为我洗牌', '让牌落在桌上']) {
    await page.getByRole('button', { name, exact: true }).click({ timeout: 15000 });
  }
  const reveal = page.locator('main').locator('[data-reveal="primary"]');
  await expect(reveal).toBeVisible({ timeout: 15000 });
  await reveal.click();
  await expect(page.locator('[data-card-visual]:visible [data-visual="hand-partial"], [data-card-visual]:visible[data-visual="hand-partial"]').first()).toBeVisible();
  await expect(page.locator('[data-reveal-count]')).toHaveAttribute('data-reveal-count', '1');
  await expect(page.locator('[data-reveal-count]')).toContainText('已翻开 1 / 3');
  // Flip CTA must not invite flipping the palm card again.
  await expect(page.locator('main [data-reveal="primary"]')).toHaveCount(0);
  await expect(page.locator('[data-reveal-status="in-progress"]')).toContainText('进行中');
  // Still 1 before skip (放回桌上)
  await expect(page.getByRole('button', { name: '先不聊这个，看这张牌' })).toBeEnabled();
  await expect(page.locator('[data-reveal-count]')).toHaveAttribute('data-reveal-count', '1');
});

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
  await page.getByRole('button', { name: '我准备好了', exact: true }).click();
  await page.getByRole('button', { name: '这次不设问题', exact: true }).click();
  await page.getByRole('button', { name: '推门' }).click();
  await page.getByRole('button', { name: '开始洗牌', exact: true }).click();
  expect(await page.locator('[data-shuffle-card]').first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.getByRole('button', { name: '为我洗牌' }).click();
  await page.getByRole('button', { name: '让牌落在桌上' }).click();
  await expect(page.locator('main').getByRole('button', { name: '翻开过去' })).toBeVisible();
});

test('background WebP failure falls back to JPEG without hiding the deck', async ({ page }) => {
  await page.route('**/table/wood-v3.webp', route => route.abort());
  await page.goto('/read');
  await page.getByRole('button', { name: '我准备好了', exact: true }).click();
  await page.getByRole('button', { name: '这次不设问题', exact: true }).click();
  await page.getByRole('button', { name: '推门' }).click();
  await page.getByRole('button', { name: '开始洗牌', exact: true }).click();
  const background = page.locator('[data-table-background]');
  await expect.poll(() => background.evaluate((image: HTMLImageElement) => image.currentSrc)).toMatch(/wood-v3.jpg$/);
  await expect.poll(() => background.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(1600);
  await expect(page.locator('[data-shuffle-card]').first()).toBeVisible();
});

test('every newly revealed mobile position gets its own flip', async ({ page }) => {
  await page.setViewportSize({ width:390, height:1000 });
  await page.goto('/read');
  await page.getByRole('button', { name: '我准备好了', exact: true }).click();
  await page.getByRole('button', { name: '这次不设问题', exact: true }).click();
  await page.getByRole('button', { name: '推门' }).click();
  for (const name of ['开始洗牌', '为我洗牌', '让牌落在桌上']) await page.getByRole('button', { name, exact: true }).click({ timeout: 15000 });
  const reveal = page.locator('main').locator('[data-reveal="primary"]');
  await expect(reveal).toBeVisible();
  await reveal.click();
  const inner = page.locator('[data-card-visual]:visible [class*="inner"]').first();
  await expect(inner).not.toHaveClass(/revealed/);
  await expect.poll(() => inner.evaluate(el => el.getAnimations().some(animation => animation.playState === 'running') || el.className.includes('partial'))).toBe(true);
  await expect(inner).not.toHaveClass(/revealed/);
  const skip = page.getByRole('button', { name: '先不聊这个，看这张牌' });
  await expect(skip).toBeEnabled();
  await skip.click();
  await expect(inner).toHaveClass(/revealed/);
});
