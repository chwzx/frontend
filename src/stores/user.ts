import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout, getUserInfo } from '@/api/auth'
import type { LoginParams, LoginResponse, MenuItem } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<LoginResponse | null>(null)
  const permissions = ref<string[]>([])
  const menus = ref<MenuItem[]>([])

  /**
   * 从 localStorage 恢复用户状态
   */
  function restoreState() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      // 尝试从 localStorage 恢复用户信息
      const savedUserInfo = localStorage.getItem('userInfo')
      if (savedUserInfo) {
        try {
          const data = JSON.parse(savedUserInfo)
          userInfo.value = data
          permissions.value = data.permissions || []
          menus.value = data.menus || []
        } catch (e) {
          // 解析失败，忽略
        }
      }
    }
  }

  // 初始化时恢复状态
  restoreState()

  /**
   * 用户登录
   */
  async function loginLogin(loginParams: LoginParams) {
    const res = await login(loginParams)
    // 响应拦截器返回的是完整响应对象 { code, message, data }
    const data = res.data || res

    token.value = data.token
    userInfo.value = data
    permissions.value = data.permissions || []
    menus.value = data.menus || []
    localStorage.setItem('token', data.token)
    // 保存用户信息到 localStorage
    localStorage.setItem('userInfo', JSON.stringify(data))
    return data
  }

  /**
   * 用户登出
   */
  async function logoutUser() {
    await logout()
    token.value = ''
    userInfo.value = null
    permissions.value = []
    menus.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  /**
   * 获取用户信息
   */
  async function fetchUserInfo() {
    const data = await getUserInfo()
    userInfo.value = data
    // 更新 localStorage
    localStorage.setItem('userInfo', JSON.stringify(data))
    return data
  }

  /**
   * 检查是否有某个权限
   */
  function hasPermission(code: string): boolean {
    return permissions.value.includes(code)
  }

  /**
   * 检查是否有任一权限
   */
  function hasAnyPermission(codes: string[]): boolean {
    return codes.some(code => permissions.value.includes(code))
  }

  return {
    token,
    userInfo,
    permissions,
    menus,
    loginLogin,
    logoutUser,
    fetchUserInfo,
    hasPermission,
    hasAnyPermission,
    restoreState
  }
})
