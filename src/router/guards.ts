import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()

    // 确保用户状态已恢复（从 localStorage）
    userStore.restoreState()

    const token = userStore.token

    // 如果没有 token 且不是登录页，跳转到登录页
    if (!token && to.path !== '/login') {
      next('/login')
      return
    }

    // 如果有 token 且访问登录页，跳转到首页
    if (token && to.path === '/login') {
      next('/dashboard')
      return
    }

    // 如果有 token 且用户信息未加载，获取用户信息
    if (token && !userStore.userInfo) {
      try {
        // 用户信息已在登录时获取，这里不需要再次获取
        // 如果需要在刷新页面后获取，可以取消注释下面代码
        // await userStore.fetchUserInfo()
      } catch (error) {
        // 如果获取用户信息失败，清除 token 并跳转到登录页
        userStore.logoutUser()
        next('/login')
        return
      }
    }

    // 允许访问
    next()
  })
}
