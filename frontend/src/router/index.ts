import { createRouter, createWebHistory } from 'vue-router'
import { APP_TITLE } from '@/config'
import { ApiError, setUnauthorizedHandler } from '@/api/request'
import { useAuthStore } from '@/stores/auth'
import { routes } from './routes'

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (to.meta.public) return true

  if (!auth.loggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (!auth.user) {
    try {
      await auth.loadUser()
    } catch (error) {
      // 只有登录失效才退出；后端没启动、网络断开时保留登录状态，到「服务暂时不可用」页重试
      if (error instanceof ApiError && error.status === 401) {
        auth.logout()
        return { name: 'login', query: { redirect: to.fullPath } }
      }
      return { name: 'unavailable', query: { redirect: to.fullPath } }
    }
  }
  // 父级路由（菜单分组）上的权限也要满足
  const denied = to.matched.some((record) => !auth.can(record.meta.permission))
  return denied ? { name: 'forbidden' } : true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - ${APP_TITLE}` : APP_TITLE
})

// 任何接口返回登录失效时回到登录页，登录后回到原页面
setUnauthorizedHandler(() => {
  useAuthStore().logout()
  const current = router.currentRoute.value
  if (current.name !== 'login') {
    void router.replace({ name: 'login', query: { redirect: current.fullPath } })
  }
})
