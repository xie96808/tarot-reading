import { expect, test } from '@playwright/test';

test('enter offers to continue an unfinished session', async ({ page }) => {
  await page.goto('/read');
  await page.evaluate(() => {
    sessionStorage.setItem(
      'tarot.ritual.v2',
      JSON.stringify({
        sessionId: 'resume-e2e',
        stage: 'question',
        question: '我在这段关系里忽略了什么？',
        spreadId: 'three',
        reversals: true,
        abandonOpen: false,
      }),
    );
  });
  await page.reload();
  await expect(page.getByRole('button', { name: '继续这局' })).toBeVisible();
  await page.getByRole('button', { name: '继续这局' }).click();
  await expect(page.getByRole('heading', { name: '此刻，什么事占着你的心？' })).toBeVisible();
});

test('three-card ritual reaches a readable result', async ({ page }) => {
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
  await expect(page.getByRole('button', { name: '书页阅读' })).toBeVisible();
  await page.getByRole('button', { name: '书页阅读' }).click();
  await expect(page.getByRole('heading', { name: '整阵线索' })).toBeVisible();
});
