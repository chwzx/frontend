import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Permission } from '@/api/permission'

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<string[]>([])
  const menus = ref<Permission[]>([])
  const isPermissionLoaded = ref(false)

  /**
   * 生成用户路由
   */
  function generateRoutes(userPermissions: string[]) {
    permissions.value = userPermissions
    isPermissionLoaded.value = true
    // TODO: 根据权限动态生成路由
  }

  /**
   * 检查是否有指定权限
   */
  function hasPermission(permissionCode: string): boolean {
    return permissions.value.includes(permissionCode)
  }

  /**
   * 重置权限
   */
  function resetPermission() {
    permissions.value = []
    menus.value = []
    isPermissionLoaded.value = false
  }

  return {
    permissions,
    menus,
    isPermissionLoaded,
    generateRoutes,
    hasPermission,
    resetPermission
  }
})
