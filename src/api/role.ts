import request from './request'

export interface Role {
  id: number
  name: string
  code: string
  description?: string
  enabled: boolean
  createTime?: string
  updateTime?: string
  permissionIds?: number[]
  children?: Role[]
  userCount?: number
  permissionCount?: number
}

export interface RoleCreateParams {
  name: string
  code: string
  description?: string
}

export interface RoleUpdateParams {
  name: string
  code: string
  description?: string
}

export interface BatchRoleParams {
  roleIds: number[]
  enabled: boolean
}

export interface AssignRoleToUserParams {
  userId: number
  roleIds: number[]
}

/**
 * 获取角色列表
 */
export function getRoleList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
}) {
  return request.get('/roles', { params })
}

/**
 * 获取角色详情
 */
export function getRole(id: number) {
  return request.get(`/roles/${id}`)
}

/**
 * 创建角色
 */
export function createRole(data: RoleCreateParams) {
  return request.post('/roles', data)
}

/**
 * 更新角色
 */
export function updateRole(id: number, data: RoleUpdateParams) {
  return request.put(`/roles/${id}`, data)
}

/**
 * 删除角色
 */
export function deleteRole(id: number) {
  return request.delete(`/roles/${id}`)
}

/**
 * 批量删除角色
 */
export function batchDeleteRoles(roleIds: number[]) {
  return request.delete('/roles/batch', { data: roleIds })
}

/**
 * 更新角色状态
 */
export function updateRoleStatus(id: number, enabled: boolean) {
  return request.put(`/roles/${id}/status`, null, { params: { enabled } })
}

/**
 * 批量更新角色状态
 */
export function batchUpdateStatus(data: BatchRoleParams) {
  return request.put('/roles/batch/status', data)
}

/**
 * 分配角色权限
 */
export function assignRolePermissions(id: number, permissionIds: number[]) {
  return request.put(`/roles/${id}/permissions`, permissionIds)
}

/**
 * 获取角色的权限 ID 列表
 */
export function getRolePermissions(id: number) {
  return request.get(`/roles/${id}/permissions`)
}

/**
 * 获取所有启用角色（用于下拉框）
 */
export function getAllRoles() {
  return request.get('/roles/all')
}

/**
 * 获取角色树形结构
 */
export function getRoleTree() {
  return request.get('/roles/tree')
}

/**
 * 复制角色
 */
export function copyRole(sourceRoleId: number, data: RoleCreateParams) {
  return request.post(`/roles/copy/${sourceRoleId}`, data)
}

/**
 * 获取角色的子角色列表
 */
export function getChildRoles(parentId: number) {
  return request.get(`/roles/children/${parentId}`)
}

/**
 * 获取角色的已分配用户列表
 */
export function getRoleAssignedUsers(id: number, params: {
  pageNum: number
  pageSize: number
  keyword?: string
}) {
  return request.get(`/roles/${id}/assigned-users`, { params })
}

/**
 * 为用户分配角色
 */
export function assignRolesToUser(data: AssignRoleToUserParams) {
  return request.put('/roles/users/assign', data)
}

/**
 * 获取用户拥有的角色列表
 */
export function getUserRoles(userId: number) {
  return request.get(`/roles/users/${userId}`)
}

/**
 * 从用户移除角色
 */
export function removeRoleFromUser(userId: number, roleId: number) {
  return request.delete(`/roles/users/${userId}/roles/${roleId}`)
}

/**
 * 获取角色的权限统计信息
 */
export function getRoleStatistics(id: number) {
  return request.get(`/roles/${id}/statistics`)
}
