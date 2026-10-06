import { expect, test } from '@playwright/test';

test('keyboard can start a shuffle from the prepare page', async ({ page }) => {
  await page.goto('/read');
  const start = page.getByRole('button', { name: '开始洗牌' });
  await expect(start).toBeEnabled();
  await start.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: '洗牌', exact: true })).toBeVisible();
  await page.goto('/read');
  await expect(page.getByRole('link', { name: '跳到正文' })).toBeAttached();
});
