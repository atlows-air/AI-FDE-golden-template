import { describe, expect, it } from 'vitest'
import { hasPermission } from './permission'

describe('hasPermission', () => {
  const owned = ['system:user:list']

  it('不需要权限时放行', () => {
    expect(hasPermission([], undefined)).toBe(true)
    expect(hasPermission([], [])).toBe(true)
  })

  it('按单个标识判断', () => {
    expect(hasPermission(owned, 'system:user:list')).toBe(true)
    expect(hasPermission(owned, 'system:user:delete')).toBe(false)
  })

  it('数组满足任意一个即可', () => {
    expect(hasPermission(owned, ['system:user:delete', 'system:user:list'])).toBe(true)
  })

  it('* 拥有全部权限', () => {
    expect(hasPermission(['*'], 'anything')).toBe(true)
  })
})
