import { expect, test } from '@playwright/test';

const sessionKey = 'tarot.ritual.v2';

test('hydration preserves a saved session until the user decides', async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on('console', (message) => { if (/hydration|hydrated|server rendered/i.test(message.text())) hydrationErrors.push(message.text()); });
  await page.addInitScript((key) => sessionStorage.setItem(key, JSON.stringify({ sessionId: 'lint-resume', stage: 'question', question: '保留我的问题', spreadId: 'three', reversals: true, abandonOpen: false })), sessionKey);
  await page.goto('/read');
  await expect(page.getByRole('button', { name: '继续这局', exact: true })).toBeVisible();
  expect(await page.evaluate((key) => JSON.parse(sessionStorage.getItem(key)!).question, sessionKey)).toBe('保留我的问题');
  await page.getByRole('button', { name: '继续这局', exact: true }).click();
  await expect(page.locator('textarea').first()).toHaveValue('保留我的问题');
  expect(hydrationErrors).toEqual([]);
});

test('storage write failure shows a fallback notice without a render loop', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('quota', 'QuotaExceededError'); }; });
  await page.goto('/read');
  await expect(page.getByText('本次仅在当前页面保留', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '我准备好了' }).click();
  await expect(page.getByRole('button', { name: '这次不设问题' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('visibility event cancels a held shuffle immediately', async ({ page }) => {
  await page.goto('/read');
  await page.getByRole('button', { name: '我准备好了' }).click();
  await page.getByRole('button', { name: '这次不设问题' }).click();
  await page.getByRole('button', { name: '开始洗牌' }).click();
  const scene = page.locator('[data-table-scene="photo"]');
  await page.keyboard.down('Space');
  await expect(scene).toHaveAttribute('data-hand', 'riffle');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(scene).toHaveAttribute('data-hand', 'none');
  await page.keyboard.up('Space');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(scene).toHaveAttribute('data-hand', 'idle');
  await expect(page.getByRole('button', { name: '为我洗牌' })).toBeEnabled();
});

test('manual reversed orientation survives timers and does not leak to another position', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.addInitScript((key) => sessionStorage.setItem(key, JSON.stringify({
    sessionId: 'orientation-test', stage: 'reveal', question: '', spreadId: 'three', reversals: true, abandonOpen: false,
    deckPreCut: [], commitFull: 'a'.repeat(64), commitShort: 'a'.repeat(16), cutIndex: 1,
    draws: [
      { positionId: 'past', cardId: '00_the_fool', orientation: 'reversed' },
      { positionId: 'present', cardId: '01_the_magician', orientation: 'reversed' },
      { positionId: 'future', cardId: '02_the_high_priestess', orientation: 'reversed' },
    ], revealed: ['past', 'present'], selectedPositionId: 'past', note: '', saveDevice: false, savePrivate: false, view: 'table',
  })), sessionKey);
  await page.goto('/read');
  await page.getByRole('button', { name: '继续这局', exact: true }).click();
  const scene = page.locator('[data-table-scene="spread"]');
  await scene.getByRole('button', { name: '看落牌方向' }).click();
  // Cross the auto-upright deadline: explicit manual choice must win.
  await page.waitForTimeout(1000);
  await expect(scene.getByRole('button', { name: '转正看清' })).toBeVisible();
  await scene.getByRole('button', { name: '2', exact: true }).click();
  await expect(scene.getByRole('button', { name: '看落牌方向' })).toBeVisible();
  await scene.getByRole('button', { name: '3', exact: true }).click();
  await scene.getByRole('button', { name: '翻开这一张', exact: true }).click();
  await expect(scene.getByRole('button', { name: '看落牌方向' })).toBeVisible();
  const flipped = scene.locator('[class*="inner"][class*="revealed"]:visible');
  await expect(flipped).toHaveCount(1);
});

test('history subscribes to local deletion and cross-tab clearing', async ({ page, context }) => {
  await page.goto('/read');
  await page.evaluate(() => {
    localStorage.setItem('tarot.history.v2', JSON.stringify(['history-1', 'history-2'].map(sessionId => ({
      receipt: { sessionId, spreadId: 'single', question: '', reversals: false, cutIndex: 1, commitShort: 'a'.repeat(16),
        draws: [{ positionId: 'focus', cardId: '00_the_fool', orientation: 'upright' }], completedAt: 1800000000000,
        revealedOrder: ['focus'], saved: true, savePrivate: false, note: '' }, savedAt: 1800000000000,
    }))));
  });
  await page.reload();
  const history = page.locator('section').filter({ has: page.getByRole('heading', { name: '仅这台设备上的记录' }) });
  await expect(history.getByRole('button', { name: '删除', exact: true })).toHaveCount(2);
  await history.getByRole('button', { name: '删除', exact: true }).first().click();
  await expect(history.getByRole('button', { name: '删除', exact: true })).toHaveCount(1);
  const other = await context.newPage();
  await other.goto('/');
  await other.evaluate(() => localStorage.removeItem('tarot.history.v2'));
  await expect(page.getByRole('heading', { name: '仅这台设备上的记录' })).toHaveCount(0);
});
