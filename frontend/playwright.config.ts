import { defineConfig } from '@playwright/test'

/**
 * 端到端测试配置。一般不直接跑 playwright，用根目录的 `pnpm e2e`：它会先启动后端和前端，等就绪后再跑测试。
 * 单独跑（服务已经在 5173 上）：pnpm --dir frontend exec playwright test
 *
 * 环境变量：
 *   E2E_BASE_URL  被测地址，默认 http://127.0.0.1:5173
 *   E2E_CHANNEL   用哪个本机已安装的浏览器：chrome（默认）、msedge；填 bundled 用 Playwright 自带的 Chromium
 *                 （自带的要先装：pnpm --dir frontend exec playwright install chromium）
 *   E2E_HEADED    设为 1 弹出浏览器窗口，调试用
 */
const channel = process.env.E2E_CHANNEL ?? 'chrome'

export default defineConfig({
  testDir: './e2e',
  // 失败时的截图、trace 放在交付文档目录下，不进 git（见 .gitignore）；正常的验收截图由用例里的 shot() 存到 docs/acceptance/screenshots/
  outputDir: '../docs/acceptance/test-results',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  // 用例共用同一个 mock 数据库，并行会互相影响
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: '../docs/acceptance/e2e-report.json' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173',
    channel: channel === 'bundled' ? undefined : channel,
    headless: process.env.E2E_HEADED !== '1',
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
})
