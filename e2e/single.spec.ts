import { expect, test } from '@playwright/test';

test('single-card ritual shows the yes-no disclaimer', async ({ page }) => {
  await page.goto('/read?spread=single');
  await expect(page.getByRole('radio', { name: /一束微光/ })).toBeChecked();
  await page.getByRole('button', { name: '开始洗牌' }).click();
  await page.getByRole('button', { name: '为我洗牌' }).click();
  await page.getByRole('button', { name: '让牌落在桌上' }).click({ timeout: 15_000 });
  await page.locator('main').locator('[data-reveal="primary"]').click();
  await expect(page.getByText('不是绝对的是或否')).toBeVisible();
});
