import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi, type CurrentUser } from '@/api/auth'
import { tokenStorage } from '@/api/request'
import { hasPermission } from '@/utils/permission'

/** 登录状态和当前用户。页面里判断权限用 auth.can('system:user:create') 或 v-permission 指令 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<CurrentUser | null>(null)
  const token = ref(tokenStorage.get())

  const loggedIn = computed(() => Boolean(token.value))

  async function login(username: string, password: string) {
    const result = await authApi.login({ username, password })
    tokenStorage.set(result.token)
    token.value = result.token
    await loadUser()
  }

  async function loadUser() {
    user.value = await authApi.me()
  }

  function logout() {
    tokenStorage.clear()
    token.value = null
    user.value = null
  }

  function can(required?: string | readonly string[]) {
    return hasPermission(user.value?.permissions ?? [], required)
  }

  return { user, token, loggedIn, login, loadUser, logout, can }
})
