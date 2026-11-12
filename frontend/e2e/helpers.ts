import path from 'node:path'
import { test as base, expect, type BrowserContext, type Page } from '@playwright/test'

/** 用演示账号登录，登录成功后离开登录页 */
export async function login(page: Page, username = 'admin', password = 'admin123') {
  await page.goto('/login')
  await page.getByPlaceholder('用户名').fill(username)
  await page.getByPlaceholder('密码').fill(password)
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page).not.toHaveURL(/\/login/)
}

/** 通过菜单进入页面：先展开一级菜单再点二级，例如 openMenu(page, '系统管理', '用户管理') */
export async function openMenu(page: Page, ...labels: string[]) {
  for (const label of labels) {
    await page
      .getByRole('menuitem', { name: label })
      .or(page.locator('.el-sub-menu__title', { hasText: label }))
      .first()
      .click()
  }
}

/**
 * 验收截图，存到 docs/acceptance/screenshots/<名字>.png，交接说明里引用。
 * 名字用「场景编号-步骤」的形式，例如 shot(page, 's1-step2-list')，这样截图和演示脚本能一一对上。
 */
export async function shot(page: Page, name: string) {
  const file = path.join(import.meta.dirname, '..', '..', 'docs', 'acceptance', 'screenshots', `${name}.png`)
  // 关掉动画再截：el-tag、弹窗、抽屉都有入场／淡出动画，不关的话截到的标签可能是空的、弹窗是半透明的
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled' })
}

/**
 * 多角色演示用的 test：每个账号一个独立的浏览器上下文（相当于各开一台电脑），用例结束自动关闭。
 * 审批、工单这类要切换账号的场景用它，不要在一个页面里反复登出登录：
 *
 *   import { test } from './helpers'
 *   test('经理审批', async ({ loginAs }) => {
 *     const sales = await loginAs('zhangwei')
 *     const manager = await loginAs('wangfang')
 *   })
 *
 * 密码不传时：admin 是 admin123，其他演示账号是 demo123。
 */
export const test = base.extend<{ loginAs: (username: string, password?: string) => Promise<Page> }>({
  loginAs: async ({ browser }, use) => {
    const contexts: BrowserContext[] = []
    await use(async (username, password = username === 'admin' ? 'admin123' : 'demo123') => {
      const context = await browser.newContext()
      contexts.push(context)
      const page = await context.newPage()
      await login(page, username, password)
      return page
    })
    await Promise.all(contexts.map((context) => context.close()))
  },
})
