import { expect, test, type Page } from '@playwright/test'
import { login, openMenu, shot } from './helpers'

/**
 * 模板自带的冒烟测试：登录、权限、列表这几条主路径。新 Demo 的演示脚本照这个写，
 * 一个场景一个文件（s1-xxx.spec.ts），每一步「操作 → 结果」对应一次操作和一次断言，关键结果用 shot() 截图。
 */

/** 在用户管理里按关键字查询，并等这次查询的响应回来再往下断言（不要靠固定等待） */
async function searchUsers(page: Page, keyword: string) {
  await page.getByPlaceholder('用户名 / 昵称 / 手机号').fill(keyword)
  const responded = page.waitForResponse((response) => response.url().includes(`keyword=${keyword}`))
  await page.getByRole('button', { name: '查询' }).click()
  await responded
}

test.describe('登录与用户管理', () => {
  test('用演示账号登录后进入首页', async ({ page }) => {
    await login(page)
    await expect(page).toHaveURL(/\/dashboard/)
    await shot(page, 'smoke-dashboard')
  })

  test('密码错误时留在登录页并提示', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('用户名').fill('admin')
    await page.getByPlaceholder('密码').fill('wrong-password')
    await page.getByRole('button', { name: '登录' }).click()
    await expect(page.getByText('用户名或密码错误')).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('管理员能在用户管理里搜索，并看到新增按钮', async ({ page }) => {
    await login(page)
    await openMenu(page, '系统管理', '用户管理')
    await expect(page.getByRole('button', { name: '新增用户' })).toBeVisible()

    await searchUsers(page, 'zhangwei')
    await expect(page.getByRole('row', { name: /zhangwei/ })).toBeVisible()
    await expect(page.getByRole('row', { name: /wangfang/ })).toHaveCount(0)
    await shot(page, 'smoke-user-search')
  })

  test('只读账号能看列表，但看不到新增按钮', async ({ page }) => {
    await login(page, 'viewer', 'demo123')
    await openMenu(page, '系统管理', '用户管理')
    await searchUsers(page, 'admin')
    await expect(page.getByRole('row', { name: /admin/ })).toBeVisible()
    await expect(page.getByRole('button', { name: '新增用户' })).toHaveCount(0)
  })
})
