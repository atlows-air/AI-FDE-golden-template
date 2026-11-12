import path from 'node:path'
import { expect, type Page } from '@playwright/test'

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
  await page.screenshot({ path: file, fullPage: true })
}
