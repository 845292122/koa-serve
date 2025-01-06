export * from './account'
export * from './perm'

export type IPage = {
  pageNo: number
  pageSize: number
  total?: number
  records?: any
}
