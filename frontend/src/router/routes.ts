import type { RouteRecordRaw } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'

/**
 * 路由即菜单：layout 下的 children 会按顺序渲染成侧边菜单。
 * 新页面在这里加一项：meta.title 是菜单名，meta.permission 是访问需要的权限（和后端 @PreAuthorize 一致），
 * 有子菜单的写成带 children 的分组。页面组件放在 src/views/<模块>/<资源>/ 下。
 */
export const layoutChildren: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { title: '首页', icon: 'HomeFilled' },
  },
  {
    path: 'system',
    name: 'system',
    redirect: '/system/users',
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'users',
        name: 'system-users',
        component: () => import('@/views/system/user/UserListView.vue'),
        meta: { title: '用户管理', icon: 'User', permission: 'system:user:list' },
      },
    ],
  },
]

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { title: '登录', public: true, hidden: true },
  },
  {
    path: '/',
    component: BasicLayout,
    redirect: '/dashboard',
    children: layoutChildren,
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/error/ForbiddenView.vue'),
    meta: { title: '没有权限', hidden: true },
  },
  {
    path: '/unavailable',
    name: 'unavailable',
    component: () => import('@/views/error/UnavailableView.vue'),
    meta: { title: '服务暂时不可用', public: true, hidden: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: { title: '页面不存在', public: true, hidden: true },
  },
]
