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
  await expect(page.getByRole('heading', { name: '今天想看看什么？' })).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveValue('我在这段关系里忽略了什么？');
});

test('three-card ritual reaches a readable result', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '开始抽牌' }).click();
  await expect(page.getByRole('button', { name: '开始洗牌' })).toBeEnabled();
  await expect(page.getByRole('radio', { name: /时间之河/ })).toBeChecked();
  await expect(page.getByRole('button', { name: '推门' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '过手' })).toHaveCount(0);
  await page.getByText('看看提问示例', { exact: true }).click();
  await page.getByRole('button', { name: '面对这个选择，我需要看清什么？' }).click();
  await expect(page.getByRole('textbox').first()).toHaveValue('面对这个选择，我需要看清什么？');
  await page.getByRole('button', { name: '开始洗牌' }).click();
  await page.getByRole('button', { name: '洗牌', exact: true }).click();
  await expect(page.getByRole('button', { name: '确认切牌' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: '确认切牌' }).click();
  const revealNext = page.locator('main').locator('[data-reveal="primary"]');
  for (let i = 0; i < 3; i += 1) {
    await expect(revealNext).toBeVisible({ timeout: 8_000 });
    await revealNext.click();
  }
  await expect(page.getByRole('button', { name: '先不聊这个，看这张牌' })).toHaveCount(0);
  await expect(page.getByText('第一张是过去')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '整阵线索' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '今天先看到这里' })).toHaveCount(0);
  await expect(page.getByText('你没有点选')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '结束这一局' })).toBeEnabled();
  await expect(page.getByRole('button', { name: '书页阅读' })).toBeVisible();
  await page.getByRole('button', { name: '书页阅读' }).click();
  await expect(page.getByRole('heading', { name: '整阵线索' })).toBeVisible();
  await page.getByRole('button', { name: '结束这一局' }).click();
  await expect(page.getByRole('heading', { name: '这次阅读已结束' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '整阵线索' })).toHaveCount(0);
});

test('an empty question can start a standard shuffle', async ({ page }) => {
  await page.goto('/read');
  await expect(page.getByRole('button', { name: '开始洗牌' })).toBeEnabled();
  await expect(page.getByRole('button', { name: '这次不设问题' })).toHaveCount(0);
  await page.getByRole('button', { name: '开始洗牌' }).click();
  await expect(page.getByRole('button', { name: '洗牌', exact: true })).toBeVisible();
});
