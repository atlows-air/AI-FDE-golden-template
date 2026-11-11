<script setup lang="ts">
/** 新增 / 编辑用户的弹窗。open() 新增，open(id) 编辑；保存成功后触发 saved。 */
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { computed, reactive, ref } from 'vue'
import { userApi, type Role, type UserSaveRequest } from '@/api/system/user'
import type { Id } from '@/types/api'

const emit = defineEmits<{ saved: [] }>()

const visible = ref(false)
const loading = ref(false)
const saving = ref(false)
const editingId = ref<Id | null>(null)
const roles = ref<Role[]>([])
const formRef = ref<FormInstance>()

const empty = (): UserSaveRequest => ({
  username: '',
  password: '',
  nickname: '',
  phone: '',
  email: '',
  status: 1,
  roleIds: [],
})
const form = reactive<UserSaveRequest>(empty())

const isEdit = computed(() => editingId.value !== null)
const rules = computed<FormRules>(() => ({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]{3,32}$/, message: '3 到 32 位字母、数字或下划线', trigger: 'blur' },
  ],
  password: isEdit.value
    ? [{ min: 6, message: '至少 6 位', trigger: 'blur' }]
    : [
        { required: true, message: '请设置密码', trigger: 'blur' },
        { min: 6, message: '至少 6 位', trigger: 'blur' },
      ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [{ pattern: /^$|^1\d{10}$/, message: '手机号格式不对', trigger: 'blur' }],
  email: [{ type: 'email', message: '邮箱格式不对', trigger: 'blur' }],
}))

async function open(id?: Id) {
  Object.assign(form, empty())
  editingId.value = id ?? null
  visible.value = true
  formRef.value?.clearValidate()
  loading.value = true
  try {
    const [roleList, user] = await Promise.all([userApi.roles(), id ? userApi.get(id) : Promise.resolve(null)])
    roles.value = roleList
    if (user) {
      Object.assign(form, {
        username: user.username,
        password: '',
        nickname: user.nickname,
        phone: user.phone ?? '',
        email: user.email ?? '',
        status: user.status,
        roleIds: user.roles.map((role) => role.id),
      })
    }
  } catch {
    visible.value = false
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!(await formRef.value?.validate().catch(() => false))) return
  saving.value = true
  try {
    const payload = { ...form, password: form.password || undefined }
    if (editingId.value) {
      await userApi.update(editingId.value, payload)
    } else {
      await userApi.create(payload)
    }
    ElMessage.success('已保存')
    visible.value = false
    emit('saved')
  } finally {
    saving.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑用户' : '新增用户'" width="520px" :close-on-click-modal="false">
    <el-form ref="formRef" v-loading="loading" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" maxlength="32" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          show-password
          autocomplete="new-password"
          :placeholder="isEdit ? '留空表示不修改' : ''"
        />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" maxlength="32" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" maxlength="11" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" maxlength="64" />
      </el-form-item>
      <el-form-item label="角色" prop="roleIds">
        <el-select v-model="form.roleIds" multiple placeholder="选择角色" style="width: 100%">
          <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>
