import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { Result } from '@/types/api'

const TOKEN_KEY = 'demo-token'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

/** 后端返回 success=false 时抛出，message 是后端的 msg，可以直接展示 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly errorCode: string,
    readonly status: number,
    readonly requestId: string | null,
  ) {
    super(message)
  }
}

/** 登录失效时的处理，由 router 注册（跳回登录页），避免这里依赖 router 造成循环引用 */
let onUnauthorized: () => void = () => {}
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

const http = axios.create({ baseURL: '/', timeout: 15000 })

http.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

type RequestOptions = AxiosRequestConfig & {
  /** 出错时不自动弹出提示，由调用方自己处理 */
  silent?: boolean
}

/**
 * 所有接口都通过它调用：自动带 token，解开 Result 只返回 data，失败时弹提示并抛 ApiError。
 * 例：const page = await request<PageResult<User>>({ url: '/api/system/users', params })
 */
export async function request<T>({ silent, ...config }: RequestOptions): Promise<T> {
  try {
    const response = await http.request<Result<T>>(config)
    const body = response.data
    if (!body.success) {
      throw new ApiError(body.msg, body.errorCode, response.status, body.requestId)
    }
    return body.data
  } catch (error) {
    const apiError = toApiError(error)
    if (apiError.status === 401 && apiError.errorCode === 'UNAUTHORIZED') {
      tokenStorage.clear()
      onUnauthorized()
    }
    if (!silent) ElMessage.error(apiError.message)
    throw apiError
  }
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (error instanceof AxiosError) {
    const body = error.response?.data as Partial<Result<unknown>> | undefined
    if (body && typeof body.msg === 'string') {
      return new ApiError(body.msg, body.errorCode ?? 'UNKNOWN', error.response?.status ?? 0, body.requestId ?? null)
    }
    if (error.code === 'ECONNABORTED') return new ApiError('请求超时，请稍后再试', 'TIMEOUT', 0, null)
    return new ApiError('连不上服务，请确认后端已启动', 'NETWORK', error.response?.status ?? 0, null)
  }
  return new ApiError('未知错误', 'UNKNOWN', 0, null)
}
