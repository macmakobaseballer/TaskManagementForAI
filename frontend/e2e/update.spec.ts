/**
 * 更新処理の E2E テスト。
 *
 * 主な仕様:
 * - シードデータ（V2__seed_dev_data.sql）の「プロジェクト Alpha」ボードを利用。
 * - カード編集・チェックリストトグル・リストタイトル編集・ラベル編集を検証する。
 *
 * 制限事項:
 * - バックエンドが http://localhost:8080 で応答し、Flyway 済み DB が必要。
 * - テストはデータを変更するため、冪等性を保つためにテスト末尾でデータを元に戻す。
 */
import { test, expect } from '@playwright/test'

test.describe('更新処理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'あなたのボード' })).toBeVisible({ timeout: 30_000 })
    await page.getByRole('button', { name: 'プロジェクト Alpha' }).click()
    await expect(page.getByRole('button', { name: '← 一覧へ' })).toBeVisible()
  })

  test('カードタイトルをクリックして編集できる', async ({ page }) => {
    // カード詳細モーダルを開く
    await page.getByRole('button', { name: /APIエラーハンドリング追加/ }).click()
    await expect(page.getByText('APIエラーハンドリング追加').first()).toBeVisible({ timeout: 15_000 })

    // タイトルをクリックして編集
    await page.getByRole('heading', { name: 'APIエラーハンドリング追加' }).click()
    const titleInput = page.locator('input[value="APIエラーハンドリング追加"]')
    await expect(titleInput).toBeVisible()

    // タイトルを変更して Enter で保存
    await titleInput.fill('APIエラーハンドリング追加 (edited)')
    await titleInput.press('Enter')

    // 保存後、更新されたタイトルが表示されること
    await expect(page.getByRole('heading', { name: 'APIエラーハンドリング追加 (edited)' })).toBeVisible({ timeout: 10_000 })

    // 元のタイトルに戻す
    await page.getByRole('heading', { name: 'APIエラーハンドリング追加 (edited)' }).click()
    const inputBack = page.locator('input[value="APIエラーハンドリング追加 (edited)"]')
    await inputBack.fill('APIエラーハンドリング追加')
    await inputBack.press('Enter')
    await expect(page.getByRole('heading', { name: 'APIエラーハンドリング追加' })).toBeVisible({ timeout: 10_000 })

    await page.getByRole('button', { name: '×' }).click()
  })

  test('チェックリストアイテムをトグルできる', async ({ page }) => {
    await page.getByRole('button', { name: /ログイン画面のデザイン修正/ }).click()
    await expect(page.getByText('チェックリスト')).toBeVisible({ timeout: 15_000 })

    // コードレビュー（未完了）をトグルして完了にする
    const codeReviewItem = page.locator('label, div').filter({ hasText: 'コードレビュー' }).first()
    const checkbox = page.locator('input[type="checkbox"]').filter({ has: page.locator(':scope + span', { hasText: 'コードレビュー' }) }).first()

    // チェックボックスが存在することを確認
    const checkboxes = page.locator('input[type="checkbox"]')
    await expect(checkboxes.first()).toBeVisible()

    // 進捗カウントが変わることを確認（1/3 → 2/3）
    await expect(page.getByText('1/3')).toBeVisible()

    // チェックボックスをクリック（コードレビューは2番目のチェックボックス）
    await checkboxes.nth(1).click()
    await expect(page.getByText('2/3')).toBeVisible({ timeout: 10_000 })

    // 元に戻す
    await checkboxes.nth(1).click()
    await expect(page.getByText('1/3')).toBeVisible({ timeout: 10_000 })

    await page.getByRole('button', { name: '×' }).click()
  })

  test('リストタイトルをダブルクリックして編集できる', async ({ page }) => {
    // Backlog リストタイトルをダブルクリック
    const backlogTitle = page.getByText('Backlog').first()
    await backlogTitle.dblclick()

    // 編集フィールドが表示される
    const listInput = page.locator('input[value="Backlog"]')
    await expect(listInput).toBeVisible()

    await listInput.fill('Backlog (edited)')
    await listInput.press('Enter')

    // 更新されたタイトルが表示される
    await expect(page.getByText('Backlog (edited)').first()).toBeVisible({ timeout: 10_000 })

    // 元のタイトルに戻す
    await page.getByText('Backlog (edited)').first().dblclick()
    const inputBack = page.locator('input[value="Backlog (edited)"]')
    await inputBack.fill('Backlog')
    await inputBack.press('Enter')
    await expect(page.getByText('Backlog').first()).toBeVisible({ timeout: 10_000 })
  })

  test('ラベルモーダルで既存ラベルを編集できる', async ({ page }) => {
    // カード詳細を開く
    await page.getByRole('button', { name: /ログイン画面のデザイン修正/ }).click()
    await expect(page.getByText('ラベル').first()).toBeVisible({ timeout: 15_000 })

    // ラベル管理モーダルを開く
    await page.getByRole('button', { name: '+ ラベル管理' }).click()
    await expect(page.getByRole('heading', { name: 'ラベル管理' })).toBeVisible()

    // 既存ラベル「バグ」の編集ボタンをクリック
    // ラベルリストの最初の編集ボタン（✏️）を探す
    const editButtons = page.locator('button[title="編集"]')
    await expect(editButtons.first()).toBeVisible()
    await editButtons.first().click()

    // 編集フォームが表示される
    const editInput = page.locator('input').filter({ hasText: '' }).first()
    await expect(editInput).toBeVisible()

    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click()

    // ラベルモーダルを閉じる
    await page.getByRole('button', { name: '×' }).last().click()
    await page.getByRole('button', { name: '×' }).last().click()
  })

  test('カードにラベルを付与・除去できる', async ({ page }) => {
    // DB接続設定の最適化（ラベルなし）のカードを開く
    await page.getByRole('button', { name: /DB接続設定の最適化/ }).click()
    await expect(page.getByText('ラベル').first()).toBeVisible({ timeout: 15_000 })

    // ラベル管理モーダルを開く
    await page.getByRole('button', { name: '+ ラベル管理' }).click()
    await expect(page.getByRole('heading', { name: 'ラベル管理' })).toBeVisible()

    // ラベルのチェックボックスが表示される（cardId を渡しているため）
    const labelCheckboxes = page.locator('input[type="checkbox"]')
    await expect(labelCheckboxes.first()).toBeVisible({ timeout: 5_000 })

    // 最初のラベルを付与
    await labelCheckboxes.first().check()

    // モーダルを閉じてカードタイルを確認
    await page.getByRole('button', { name: '×' }).last().click()
    await page.getByRole('button', { name: '×' }).last().click()

    // カード詳細を再度開き、ラベルが付与されていることを確認
    await page.getByRole('button', { name: /DB接続設定の最適化/ }).click()
    await expect(page.locator('.flex.flex-wrap.gap-1\\.5 span').first()).toBeVisible({ timeout: 10_000 })

    // クリーンアップ: ラベルを除去
    await page.getByRole('button', { name: '+ ラベル管理' }).click()
    const checkboxes2 = page.locator('input[type="checkbox"]')
    await checkboxes2.first().uncheck()
    await page.getByRole('button', { name: '×' }).last().click()
    await page.getByRole('button', { name: '×' }).last().click()
  })
})
