import { expect, test } from '@playwright/test';

test('celtic cross reveals ten positions and grouped reading', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/read');
  await page.getByRole('button', { name: '我准备好了' }).click();
  await page.getByRole('button', { name: '这次不设问题' }).click();
  await page.getByRole('button', { name: /处境之镜/ }).click();
  await page.getByRole('button', { name: '开始洗牌' }).click();
  await page.getByRole('button', { name: '为我洗牌' }).click();
  await page.getByRole('button', { name: '让牌落在桌上' }).click({ timeout: 15_000 });
  const reveal = page.locator('main').getByRole('button', { name: '翻开这一张' }).last();
  for (let i = 0; i < 10; i += 1) {
    await expect(reveal).toBeVisible({ timeout: 8_000 });
    await reveal.click();
  }
  await expect(page.getByRole('heading', { name: '当下核心' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '条件性收束' })).toBeVisible();
  await expect(page.getByRole('button', { name: '现状' }).first()).toBeVisible();
});
