import { describe, expect, it } from 'vitest'
import { filenameFrom } from './request'

describe('filenameFrom', () => {
  it('优先取 UTF-8 编码的文件名', () => {
    expect(filenameFrom('attachment; filename="a.xlsx"; filename*=UTF-8\'\'%E5%90%88%E5%90%8C.xlsx')).toBe('合同.xlsx')
  })

  it('没有编码名时取普通文件名', () => {
    expect(filenameFrom('attachment; filename="report.pdf"')).toBe('report.pdf')
  })

  it('没有文件名返回 null', () => {
    expect(filenameFrom('attachment')).toBeNull()
  })
})
