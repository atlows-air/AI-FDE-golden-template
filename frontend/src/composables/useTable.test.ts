import { describe, expect, it } from 'vitest'
import type { PageResult } from '@/types/api'
import { useTable } from './useTable'

const page = (names: string[]): PageResult<string> => ({ records: names, total: names.length, current: 1, size: 10 })

/** 一个可以手动决定什么时候返回的假接口 */
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => (resolve = done))
  return { promise, resolve }
}

describe('useTable', () => {
  it('先发出的请求后返回时，不覆盖后发出的结果（刚进页面就搜索的场景）', async () => {
    const first = deferred<PageResult<string>>()
    const second = deferred<PageResult<string>>()
    const pending = [first, second]
    const table = useTable(() => pending.shift()!.promise, { keyword: '' })

    const loadAll = table.load() // 进页面时的第一次加载
    table.query.keyword = 'zhangwei'
    const search = table.search() // 马上搜索

    second.resolve(page(['zhangwei']))
    await search
    first.resolve(page(['a', 'b', 'c'])) // 过期的结果迟到了
    await loadAll

    expect(table.rows.value).toEqual(['zhangwei'])
    expect(table.total.value).toBe(1)
    expect(table.loading.value).toBe(false)
  })

  it('搜索回到第一页，重置恢复初始条件', async () => {
    const calls: unknown[] = []
    const table = useTable(
      async (query) => {
        calls.push({ ...query })
        return page(['x'])
      },
      { keyword: '' },
    )
    table.query.current = 3
    table.query.keyword = 'k'
    await table.search()
    expect(calls.at(-1)).toMatchObject({ keyword: 'k', current: 1 })

    await table.reset()
    expect(calls.at(-1)).toMatchObject({ keyword: '', current: 1 })
  })

  it('删掉最后一页的最后一条后，自动回到上一页', async () => {
    const table = useTable(
      async (query) => (query.current === 2 ? { records: [], total: 10, current: 2, size: 10 } : page(['x'])),
      {},
    )
    table.query.current = 2
    await table.load()
    expect(table.query.current).toBe(1)
    expect(table.rows.value).toEqual(['x'])
  })
})
