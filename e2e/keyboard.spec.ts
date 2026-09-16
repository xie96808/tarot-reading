import { expect, test } from '@playwright/test';

test('keyboard can enter and skip the question', async ({ page }) => {
  await page.goto('/read');
  await page.getByRole('button', { name: '我准备好了' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: '此刻，什么事占着你的心？' })).toBeVisible();
  await page.getByRole('button', { name: '这次不设问题' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: '开始洗牌' })).toBeVisible();
  await page.goto('/read');
  await expect(page.getByRole('link', { name: '跳到正文' })).toBeAttached();
});
