/** 后端统一返回体，见 backend 的 Result.java */
export interface Result<T> {
  code: number
  errorCode: string
  success: boolean
  msg: string
  data: T
  requestId: string | null
}

/** 分页结果，见 backend 的 PageResult.java */
export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

/** 分页查询参数，见 backend 的 PageQuery.java */
export interface PageQuery {
  current: number
  size: number
}

/** 后端的 Long id 一律以字符串返回，避免 JS 精度丢失 */
export type Id = string
