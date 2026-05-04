/**
 * ボード一覧・カンバン・カード詳細モーダルまでのスモーク E2E。
 *
 * 主な仕様:
 * - シードデータ（V2__seed_dev_data.sql）に依存する表示文言で検証する。
 *
 * 制限事項:
 * - バックエンドが http://localhost:8080 で応答し、Flyway 済み DB が必要。
 */
import { test, expect } from '@playwright/test'

test.describe('API レビュー画面', () => {
  test('ボード一覧からカード詳細モーダルまで遷移できる', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { level: 1, name: 'TaskManagementForAI' }),
    ).toBeVisible()

    await expect(page.getByRole('heading', { name: 'あなたのボード' })).toBeVisible({
      timeout: 30_000,
    })

    await page.getByRole('button', { name: 'プロジェクト Alpha' }).click()

    await expect(page.getByRole('button', { name: '← 一覧へ' })).toBeVisible()
    await expect(page.getByText('プロジェクト Alpha').first()).toBeVisible()

    await page.getByRole('button', { name: /ログイン画面のデザイン修正/ }).click()

    await expect(
      page.getByRole('heading', { name: 'ログイン画面のデザイン修正' }),
    ).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('チェックリスト')).toBeVisible()

    await page.getByRole('button', { name: '×' }).click()
    await expect(
      page.getByRole('heading', { name: 'ログイン画面のデザイン修正' }),
    ).not.toBeVisible()
  })
})
