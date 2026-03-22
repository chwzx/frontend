import request from './request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: number
  username: string
  nickname: string
  permissions?: string[]
  menus?: MenuItem[]
}

export interface MenuItem {
  id: number
  name: string
  path: string
  component?: string
  icon?: string
  type: string
  code?: string
  children?: MenuItem[]
  sort?: number
}

export interface RegisterParams {
  username: string
  password: string
  confirmPassword: string
  nickname: string
  email?: string
}

export interface RegisterResponse {
  message: string
}

/**
 * 用户登录
 */
export function login(data: LoginParams) {
  return request.post<LoginResponse>('/auth/login', data)
}

/**
 * 用户注册
 */
export function register(data: RegisterParams) {
  return request.post<RegisterResponse>('/auth/register', data)
}

/**
 * 用户登出
 */
export function logout() {
  return request.post('/auth/logout')
}

/**
 * 获取当前用户信息
 */
export function getUserInfo() {
  return request.get('/auth/info')
}
