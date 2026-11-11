import { reactive, ref, type UnwrapRef } from 'vue'
import type { PageQuery, PageResult } from '@/types/api'

/**
 * 列表页的分页、搜索、加载状态。所有分页列表都用它，不要每页自己写一遍。
 *
 *   const table = useTable((query) => userApi.page(query), { keyword: '' })
 *   onMounted(table.load)
 *   // 模板里：table.rows / table.total / table.loading / table.query
 */
export function useTable<T, F extends object>(
  fetcher: (query: F & PageQuery) => Promise<PageResult<T>>,
  filters: F,
  pageSize = 10,
) {
  const initial = { ...filters }
  const query = reactive({ ...filters, current: 1, size: pageSize }) as UnwrapRef<F & PageQuery>
  const rows = ref<T[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      const page = await fetcher({ ...(query as F & PageQuery) })
      rows.value = page.records as UnwrapRef<T[]>
      total.value = page.total
      // 删掉最后一页的最后一条后，回到上一页
      if (page.records.length === 0 && query.current > 1 && page.total > 0) {
        query.current -= 1
        await load()
      }
    } finally {
      loading.value = false
    }
  }

  /** 改了搜索条件后调用：回到第一页 */
  function search() {
    query.current = 1
    return load()
  }

  function reset() {
    Object.assign(query, initial, { current: 1 })
    return load()
  }

  return { query, rows, total, loading, load, search, reset }
}
