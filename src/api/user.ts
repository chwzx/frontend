import request from './request'

export interface User {
  id: number
  username: string
  nickname: string
  email?: string
  phone?: string
  avatar?: string
  enabled: boolean
  createTime?: string
  updateTime?: string
  roleIds?: number[]
  roles?: Role[]
}

export interface Role {
  id: number
  name: string
  code: string
}

export interface UserCreateParams {
  username: string
  nickname: string
  email?: string
  phone?: string
  password: string
  roleIds?: number[]
}

export interface UserUpdateParams {
  nickname: string
  email?: string
  phone?: string
  roleIds?: number[]
}

/**
 * 获取用户列表
 */
export function getUserList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
}) {
  return request.get('/users', { params })
}

/**
 * 获取用户详情
 */
export function getUser(id: number) {
  return request.get(`/users/${id}`)
}

/**
 * 创建用户
 */
export function createUser(data: UserCreateParams) {
  return request.post('/users', data)
}

/**
 * 更新用户
 */
export function updateUser(id: number, data: UserUpdateParams) {
  return request.put(`/users/${id}`, data)
}

/**
 * 删除用户
 */
export function deleteUser(id: number) {
  return request.delete(`/users/${id}`)
}

/**
 * 更新用户状态
 */
export function updateUserStatus(id: number, enabled: boolean) {
  return request.put(`/users/${id}/status`, null, { params: { enabled } })
}

/**
 * 获取用户角色列表
 */
export function getUserRoles(id: number) {
  return request.get(`/users/${id}/roles`)
}

/**
 * 为用户分配角色
 */
export function assignUserRoles(id: number, roleIds: number[]) {
  return request.post(`/users/${id}/roles`, { roleIds })
}
