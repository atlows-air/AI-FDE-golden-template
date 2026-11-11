import type { Id } from '@/types/api'
import { request } from './request'

export interface LoginResponse {
  token: string
  /** 秒 */
  expiresIn: number
}

export interface CurrentUser {
  id: Id
  username: string
  nickname: string
  roles: string[]
  permissions: string[]
}

export const authApi = {
  login: (data: { username: string; password: string }) =>
    request<LoginResponse>({ url: '/api/auth/login', method: 'post', data, silent: true }),
  me: () => request<CurrentUser>({ url: '/api/auth/me', silent: true }),
}
