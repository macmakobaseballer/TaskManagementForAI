/**
 * Playwright の E2E 設定。
 *
 * 主な仕様:
 * - `npm run dev`（Vite）を webServer で自動起動し、/api は Vite プロキシ経由でバックエンドへ転送する。
 * - バックエンド（:8080）と PostgreSQL はテスト実行前に別途起動している前提。
 *
 * 制限事項:
 * - CI では DB・Spring を立ち上げるジョブと組み合わせる必要がある。
 */
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
