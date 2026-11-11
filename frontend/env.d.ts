/// <reference types="vite/client" />

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 菜单和浏览器标题 */
    title?: string
    /** 菜单图标，Element Plus 图标组件名 */
    icon?: string
    /** 访问需要的权限标识，没有就是登录即可访问 */
    permission?: string
    /** 不需要登录 */
    public?: boolean
    /** 不出现在侧边菜单里 */
    hidden?: boolean
  }
}
