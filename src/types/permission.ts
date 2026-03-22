export interface Permission {
  id: number
  name: string
  code: string
  type: string
  parentId?: number
  path?: string
  component?: string
  sort?: number
  description?: string
  createTime?: string
  updateTime?: string
  children?: Permission[]
}
