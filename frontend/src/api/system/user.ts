import type { Id, PageQuery, PageResult } from '@/types/api'
import { request } from '../request'

/**
 * 用户管理接口，对应 backend 的 UserController。
 * 新模块照这个写：一个资源一个文件，类型和后端 DTO 一一对应。
 */

export interface Role {
  id: Id
  code: string
  name: string
}

export interface User {
  id: Id
  username: string
  nickname: string
  phone: string | null
  email: string | null
  /** 1 启用，0 停用 */
  status: 0 | 1
  roles: Role[]
  createTime: string
}

export interface UserQuery extends PageQuery {
  keyword?: string
  status?: 0 | 1
}

export interface UserSaveRequest {
  username: string
  /** 编辑时留空表示不修改 */
  password?: string
  nickname: string
  phone?: string
  email?: string
  status: 0 | 1
  roleIds: Id[]
}

const BASE = '/api/system/users'

export const userApi = {
  page: (params: UserQuery) => request<PageResult<User>>({ url: BASE, params }),
  get: (id: Id) => request<User>({ url: `${BASE}/${id}` }),
  create: (data: UserSaveRequest) => request<{ id: Id }>({ url: BASE, method: 'post', data }),
  update: (id: Id, data: UserSaveRequest) => request<void>({ url: `${BASE}/${id}`, method: 'put', data }),
  remove: (id: Id) => request<void>({ url: `${BASE}/${id}`, method: 'delete' }),
  roles: () => request<Role[]>({ url: `${BASE}/roles` }),
}
