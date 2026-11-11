<script setup lang="ts">
/**
 * 用户管理列表。这是模板里的参考页面，新的列表页照这个结构写：
 * 搜索栏 + 操作按钮 → 表格 → 分页；新增/编辑用弹窗组件；分页逻辑用 useTable。
 */
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { userApi, type User } from '@/api/system/user'
import { useTable } from '@/composables/useTable'
import { useAuthStore } from '@/stores/auth'
import UserFormDialog from './UserFormDialog.vue'

const auth = useAuthStore()
const table = useTable((query) => userApi.page(query), {
  keyword: '',
  status: undefined as 0 | 1 | undefined,
})
onMounted(table.load)

const dialog = ref<InstanceType<typeof UserFormDialog>>()

async function remove(user: User) {
  try {
    await ElMessageBox.confirm(`确定删除用户「${user.nickname}」？`, '删除用户', {
      type: 'warning',
      confirmButtonText: '删除',
    })
  } catch {
    return
  }
  await userApi.remove(user.id)
  ElMessage.success('已删除')
  await table.load()
}
</script>

<template>
  <div class="page-card">
    <div class="page-toolbar">
      <el-form inline @submit.prevent="table.search">
        <el-form-item>
          <el-input
            v-model="table.query.keyword"
            placeholder="用户名 / 昵称 / 手机号"
            clearable
            prefix-icon="Search"
            style="width: 240px"
            @clear="table.search"
          />
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="table.query.status"
            placeholder="状态"
            clearable
            style="width: 120px"
            @change="table.search"
          >
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">查询</el-button>
          <el-button @click="table.reset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button v-permission="'system:user:create'" type="primary" icon="Plus" @click="dialog?.open()">
        新增用户
      </el-button>
    </div>

    <el-table v-loading="table.loading.value" :data="table.rows.value" row-key="id">
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="nickname" label="昵称" min-width="120" />
      <el-table-column label="角色" min-width="140">
        <template #default="{ row }">
          <el-tag v-for="role in row.roles" :key="role.id" size="small" class="role-tag">{{ role.name }}</el-tag>
          <span v-if="row.roles.length === 0" class="muted">无</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" min-width="130">
        <template #default="{ row }">{{ row.phone ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="170" />
      <el-table-column
        v-if="auth.can(['system:user:update', 'system:user:delete'])"
        label="操作"
        width="140"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button v-permission="'system:user:update'" link type="primary" @click="dialog?.open(row.id)"
            >编辑</el-button
          >
          <el-button v-permission="'system:user:delete'" link type="danger" @click="remove(row as User)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="page-pagination">
      <el-pagination
        v-model:current-page="table.query.current"
        v-model:page-size="table.query.size"
        :total="table.total.value"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        background
        @current-change="table.load"
        @size-change="table.search"
      />
    </div>

    <UserFormDialog ref="dialog" @saved="table.load" />
  </div>
</template>

<style scoped>
.role-tag + .role-tag {
  margin-left: 4px;
}

.muted {
  color: var(--el-text-color-placeholder);
}
</style>
