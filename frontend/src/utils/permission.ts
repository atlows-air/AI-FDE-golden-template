/** 超级权限标识：拥有它等于拥有全部权限 */
export const ALL_PERMISSIONS = '*'

/**
 * 判断是否拥有权限。required 可以是单个标识或数组（满足任意一个即可）；不传表示不需要权限。
 */
export function hasPermission(owned: readonly string[], required?: string | readonly string[]): boolean {
  if (!required || (Array.isArray(required) && required.length === 0)) return true
  if (owned.includes(ALL_PERMISSIONS)) return true
  const list = typeof required === 'string' ? [required] : required
  return list.some((item) => owned.includes(item))
}
