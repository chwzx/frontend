import request from './request'

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

export interface PermissionCreateParams {
  name: string
  code: string
  type: string
  parentId?: number
  path?: string
  component?: string
  sort?: number
  description?: string
}

export interface PermissionUpdateParams {
  name: string
  code: string
  type: string
  parentId?: number
  path?: string
  component?: string
  sort?: number
  description?: string
}

/**
 * 获取权限列表
 */
export function getPermissionList() {
  return request.get('/permissions')
}

/**
 * 获取权限树
 */
export function getPermissionTree() {
  return request.get('/permissions/tree')
}

/**
 * 创建权限
 */
export function createPermission(data: PermissionCreateParams) {
  return request.post('/permissions', data)
}

/**
 * 更新权限
 */
export function updatePermission(id: number, data: PermissionUpdateParams) {
  return request.put(`/permissions/${id}`, data)
}

/**
 * 删除权限
 */
export function deletePermission(id: number) {
  return request.delete(`/permissions/${id}`)
}
