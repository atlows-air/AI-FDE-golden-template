import type { Directive } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * 没有权限就不渲染元素。例：<el-button v-permission="'system:user:create'">新增</el-button>
 * 只用于隐藏按钮，接口本身由后端 @PreAuthorize 把关。
 */
export const vPermission: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    if (!useAuthStore().can(binding.value)) el.remove()
  },
}
