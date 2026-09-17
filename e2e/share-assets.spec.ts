import { expect, test } from '@playwright/test';
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { CARD_IDS } from '../src/data/card-ids';
import { SPREADS, type SpreadId } from '../src/data/lexicons/zh-1/spreads';
import { encodeReading } from '../src/lib/reading-codec';

test('default share cover is configured and fetchable', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\/og-cover.jpg$/);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /\/og\/og-cover.jpg$/);
  const image = await request.get('/og/og-cover.jpg');
  expect(image.ok()).toBe(true);
  expect(await sharp(await image.body()).metadata()).toMatchObject({ width: 1200, height: 630 });
});

for (const spreadId of ['single', 'three', 'celtic'] as SpreadId[]) {
  test(`${spreadId} dynamic preview uses local Chinese font and excludes private question`, async ({ page, request }, testInfo) => {
    const id = encodeReading({ v: 1, deckVersion: 'rws-1', lexiconVersion: 'zh-1', algo: 'fy-hkdf-2',
      spreadId, q: spreadId === 'celtic' ? null : 'PRIVATE_PREVIEW_SENTINEL', reversals: true, cutIndex: 12,
      commit: 'a3f2c91b0d44e17f', ts: 1800000000,
      draws: SPREADS[spreadId].positions.map((p, i) => ({ positionId: p.id, cardId: CARD_IDS[i], orientation: i % 2 ? 'reversed' : 'upright' })),
    });
    await page.goto(`/r/${id}`);
    const tags = await page.locator('meta[property^="og:"], meta[name^="twitter:"]').evaluateAll(nodes =>
      nodes.filter(n => !n.getAttribute('property')?.includes('image') && !n.getAttribute('name')?.includes('image')).map(n => n.getAttribute('content')).join(' '));
    expect(tags).not.toContain('PRIVATE_PREVIEW_SENTINEL');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/opengraph-image/);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /\/opengraph-image/);
    const url = new URL((await page.locator('meta[property="og:image"]').getAttribute('content'))!);
    const image = await request.get(url.pathname + url.search);
    expect(image.ok()).toBe(true);
    const body = await image.body();
    expect(await sharp(body).metadata()).toMatchObject({ width: 1200, height: 630 });
    await writeFile(testInfo.outputPath(`og-${spreadId}.png`), body);
    await page.screenshot({ path: testInfo.outputPath(`reading-${spreadId}.png`), fullPage: true });
  });
}

test('copy-share button generates a working link and persists device history', async ({ page }) => {
  await page.goto('/read');
  await page.getByRole('button', { name: '我准备好了' }).click();
  await page.getByRole('button', { name: '这次不设问题' }).click();
  await page.getByRole('button', { name: '开始洗牌' }).click();
  await page.getByRole('button', { name: '为我洗牌' }).click();
  await expect(page.getByRole('button', { name: '让牌落在桌上' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: '让牌落在桌上' }).click();
  const revealNext = page.locator('main').getByRole('button', { name: '翻开这一张' }).last();
  await expect(revealNext).toBeVisible({ timeout: 8_000 });
  await revealNext.click();
  await revealNext.click();
  await revealNext.click();
  await expect(page.getByRole('heading', { name: '整阵线索' })).toBeVisible();
  await page.getByRole('checkbox', { name: '保存到这台设备' }).check();
  await page.getByRole('button', { name: '写一句，留给自己' }).click();
  await page.getByRole('button', { name: '复制本局链接' }).click();
  const shareBox = page.getByRole('textbox');
  await expect(shareBox).toHaveValue(/\/r\/1\./, { timeout: 5_000 });
  const shareUrl = await shareBox.inputValue();
  await page.goto(shareUrl);
  await expect(page.getByRole('heading', { name: '整阵线索' })).toBeVisible();
  await page.goto('/read');
  await expect(page.getByText('仅这台设备上的记录')).toBeVisible();
});
