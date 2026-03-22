import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * 权限指令
 * v-permission="['user:add']" - 当用户拥有任一指定权限时显示元素
 * v-permission="'user:add'" - 当用户拥有指定权限时显示元素
 */
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()

    if (value) {
      // 支持单个权限或权限数组
      const permissions = Array.isArray(value) ? value : [value]

      // 检查是否有任一权限
      const hasPermission = permissions.some((permission: string) => {
        return userStore.hasPermission(permission)
      })

      // 如果没有权限，隐藏元素
      if (!hasPermission) {
        el.style.display = 'none'
      }
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()

    if (value) {
      const permissions = Array.isArray(value) ? value : [value]
      const hasPermission = permissions.some((permission: string) => {
        return userStore.hasPermission(permission)
      })

      if (!hasPermission) {
        el.style.display = 'none'
      } else {
        el.style.display = ''
      }
    }
  }
}
