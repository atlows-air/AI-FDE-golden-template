<script setup lang="ts">
import { computed } from 'vue'
import { APP_TITLE } from '@/config'
import { useRoute, useRouter, type RouteRecordRaw } from 'vue-router'
import { layoutChildren } from '@/router/routes'
import { useAuthStore } from '@/stores/auth'

interface MenuItem {
  path: string
  title: string
  icon?: string
  children: MenuItem[]
}

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

/** 从路由生成菜单：去掉隐藏的、没权限的，以及子菜单全被过滤掉的分组 */
function toMenu(records: RouteRecordRaw[], parent: string): MenuItem[] {
  return records.flatMap((record) => {
    if (record.meta?.hidden || !auth.can(record.meta?.permission)) return []
    const path = `${parent}/${record.path}`
    const children = record.children ? toMenu(record.children, path) : []
    if (record.children && children.length === 0) return []
    return [{ path, title: record.meta?.title ?? record.path, icon: record.meta?.icon, children }]
  })
}

const menu = computed(() => toMenu(layoutChildren, ''))
const breadcrumbs = computed(() =>
  route.matched.filter((record) => record.meta.title).map((record) => record.meta.title),
)

function logout() {
  auth.logout()
  void router.replace({ name: 'login' })
}
</script>

<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="brand">{{ APP_TITLE }}</div>
      <el-menu :default-active="route.path" router class="menu">
        <template v-for="item in menu" :key="item.path">
          <el-sub-menu v-if="item.children.length" :index="item.path">
            <template #title>
              <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path">
              <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.path">
            <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="title in breadcrumbs" :key="title">{{ title }}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-dropdown trigger="click">
          <span class="user">
            <el-icon><UserFilled /></el-icon>
            {{ auth.user?.nickname }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>{{ auth.user?.username }}</el-dropdown-item>
              <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main class="main">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100%;
}

.aside {
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
}

.brand {
  height: 56px;
  padding: 0 20px;
  font-size: 18px;
  font-weight: 600;
  line-height: 56px;
}

.menu {
  flex: 1;
  border-right: none;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
}

.user {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  cursor: pointer;
}

.main {
  padding: 16px;
}
</style>
