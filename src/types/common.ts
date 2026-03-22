export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  orders: any[]
  optimizeCountSql: boolean
  searchCount: boolean
  maxLimit: any
  countId: any
  pages: number
}
