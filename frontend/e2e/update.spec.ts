/**
 * 更新処理の E2E テスト。
 *
 * 主な仕様:
 * - シードデータ（V2__seed_dev_data.sql）の「プロジェクト Alpha」ボードを利用。
 * - カード編集・チェックリストトグル・リストタイトル編集・ラベルを検証する。
 *
 * 制限事項:
 * - バックエンドが http://localhost:8080 で応答し、Flyway 済み DB が必要。
 * - テストはデータを変更するため、末尾で元に戻す。
 */
import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'

/**
 * CardDetail の白ペイン本体（Tailwind で max-w-2xl）。
 * `<label>` に htmlFor が無く getByLabel が使えないため、題名入力 placeholder で識別する。
 *
 * @param {Page} page 対象ページ
 * @returns {import('@playwright/test').Locator} カード詳細ペイン locator
 */
function card_detail_panel(page: Page) {
  return page
    .locator('div.max-w-2xl')
    .filter({ has: page.locator('input[placeholder="タイトルを入力"]') })
    .first()
}

/**
 * ラベル管理モーダル（ボードヘッダーから開く）のルートコンテナを返す。
 * @param {Page} page 対象ページ
 * @returns {import('@playwright/test').Locator} ラベル管理モーダル locator
 */
function label_manage_modal(page: Page) {
  return page.locator('div.fixed.z-60').filter({ has: page.getByRole('heading', { name: 'ラベル管理' }) })
}

test.describe('更新処理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'あなたのボード' })).toBeVisible({ timeout: 30_000 })
    await page.getByRole('button', { name: 'プロジェクト Alpha' }).click()
    await expect(page.getByRole('button', { name: '← 一覧へ' })).toBeVisible()
  })

  test('カードタイトルを編集して一括保存できる', async ({ page }) => {
    await page.getByText('APIエラーハンドリング追加', { exact: true }).first().click()

    const overlay = card_detail_panel(page)
    const titleInput = overlay.locator('input[placeholder="タイトルを入力"]')
    await expect(titleInput).toBeVisible({ timeout: 15_000 })
    await expect(titleInput).toHaveValue('APIエラーハンドリング追加')

    await titleInput.fill('APIエラーハンドリング追加 (edited)')
    await overlay.getByRole('button', { name: '保存' }).click()

    await expect(overlay.locator('input[placeholder="タイトルを入力"]')).not.toBeVisible({
      timeout: 10_000,
    })
    await expect(
      page.getByText('APIエラーハンドリング追加 (edited)', { exact: true }).first(),
    ).toBeVisible({ timeout: 10_000 })

    await page.getByText('APIエラーハンドリング追加 (edited)', { exact: true }).first().click()
    const reopen = card_detail_panel(page)
    await reopen.locator('input[placeholder="タイトルを入力"]').fill('APIエラーハンドリング追加')
    await reopen.getByRole('button', { name: '保存' }).click()

    await expect(page.getByText('APIエラーハンドリング追加', { exact: true }).first()).toBeVisible({
      timeout: 10_000,
    })
  })

  test('チェックリストアイテムをトグルできる', async ({ page }) => {
    await page.getByText('ログイン画面のデザイン修正', { exact: true }).first().click()

    const overlay = card_detail_panel(page)
    await expect(overlay.getByText('チェックリスト', { exact: true }).first()).toBeVisible({
      timeout: 15_000,
    })

    await expect(overlay.getByText('1/3').first()).toBeVisible()

    const checkboxes = overlay.locator('input[type="checkbox"]')
    await expect(checkboxes.nth(1)).toBeVisible()
    await checkboxes.nth(1).click()
    await expect(overlay.getByText('2/3').first()).toBeVisible({ timeout: 10_000 })

    await checkboxes.nth(1).click()
    await expect(overlay.getByText('1/3').first()).toBeVisible({ timeout: 10_000 })

    await overlay.getByRole('button', { name: '×' }).click()
  })

  test('リストタイトルをダブルクリックして編集できる', async ({ page }) => {
    const firstListTitle = page
      .locator('.w-72.flex-shrink-0')
      .first()
      .locator('span.flex-1.cursor-pointer')
      .filter({ hasText: /^Backlog$/ })
    await firstListTitle.click({ clickCount: 2, delay: 40 })

    const firstListColumn = page.locator('.w-72.flex-shrink-0').first()
    const listInput = firstListColumn.locator('input[class*="flex-1"][class*="font-bold"]')
    await expect(listInput).toBeVisible({ timeout: 10_000 })
    await expect(listInput).toHaveValue('Backlog')

    await listInput.fill('Backlog (edited)')
    await listInput.press('Enter')

    await expect(
      firstListColumn.locator('span.flex-1.cursor-pointer').filter({ hasText: /^Backlog \(edited\)$/ }),
    ).toBeVisible({ timeout: 10_000 })

    await firstListColumn.locator('span.flex-1.cursor-pointer').filter({ hasText: /^Backlog \(edited\)$/ }).click({
      clickCount: 2,
      delay: 40,
    })

    const restoreInput = firstListColumn.locator('input[class*="flex-1"][class*="font-bold"]')
    await expect(restoreInput).toBeVisible({ timeout: 10_000 })
    await restoreInput.fill('Backlog')
    await restoreInput.press('Enter')

    await expect(
      firstListColumn.locator('span.flex-1.cursor-pointer').filter({ hasText: /^Backlog$/ }).first(),
    ).toBeVisible({ timeout: 10_000 })
  })

  test('ヘッダーからラベル管理で既存ラベルを編集できる', async ({ page }) => {
    await page.locator('button[title="設定"]').click()
    await page.getByRole('button', { name: 'ラベル管理' }).click()

    const modal = label_manage_modal(page)
    await expect(modal.getByRole('heading', { name: 'ラベル管理' })).toBeVisible()

    await modal.locator('button[title="編集"]').first().click()

    const nameInput = modal.locator('input[placeholder="ラベル名"]').first()
    await expect(nameInput).toBeVisible()

    await nameInput.fill('バグ (edited)')
    await modal.getByRole('button', { name: '保存' }).first().click()

    await expect(modal.locator('span.rounded-full').filter({ hasText: 'バグ (edited)' }).first()).toBeVisible({
      timeout: 10_000,
    })

    await modal.locator('button[title="編集"]').first().click()
    await modal.locator('input[placeholder="ラベル名"]').first().fill('バグ')
    await modal.getByRole('button', { name: '保存' }).first().click()

    await expect(modal.locator('span.rounded-full').filter({ hasText: 'バグ' }).first()).toBeVisible({
      timeout: 10_000,
    })
    await modal.getByRole('button', { name: '×' }).click()
  })

  test('カード詳細のドロップダウンでラベルを付与・除去できる', async ({ page }) => {
    await page.getByText('DB接続設定の最適化', { exact: true }).first().click()

    const overlay = card_detail_panel(page)
    await expect(overlay.locator('label').filter({ hasText: /^ラベル$/ })).toBeVisible({
      timeout: 15_000,
    })

    // ラベル行は form 関連付けより DOM 親子でトリガーを押す（表示文言は環境により accessible name とずれることがある）
    await overlay.locator('div.mb-4.relative').locator('button[type="button"]').first().click()

    // アクセシブル名はラベルのピル文言（実名「バグ」）と完全一致。「バグ (edited)」と区別する。
    const assign_box = overlay.getByRole('checkbox', { name: 'バグ', exact: true })
    await expect(assign_box).toBeVisible({ timeout: 5_000 })

    await expect(assign_box).not.toBeChecked()
    await assign_box.click()
    await expect(assign_box).toBeChecked({ timeout: 15_000 })

    const label_trigger = overlay.locator('div.mb-4.relative').locator('button[type="button"]').first()
    await expect(label_trigger.locator('span.rounded-full').filter({ hasText: /^バグ$/ })).toBeVisible({
      timeout: 10_000,
    })

    await expect(assign_box).toBeEnabled({ timeout: 15_000 })
    await assign_box.click()
    await expect(assign_box).not.toBeChecked({ timeout: 15_000 })
    await page.keyboard.press('Escape')
    await overlay.getByRole('button', { name: '×' }).click()
  })
})
