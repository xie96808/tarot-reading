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
