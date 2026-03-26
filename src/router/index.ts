import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { setupRouterGuard } from './guards'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/',
    component: () => import('@/components/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'DataAnalysis' }
      }
    ]
  },
  {
    path: '/system',
    component: () => import('@/components/layout/index.vue'),
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'user',
        name: 'UserManagement',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理', icon: 'User', permission: 'system:user' }
      },
      {
        path: 'role',
        name: 'RoleManagement',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理', icon: 'Avatar', permission: 'system:role' }
      },
      {
        path: 'permission',
        name: 'PermissionManagement',
        component: () => import('@/views/system/permission/index.vue'),
        meta: { title: '权限管理', icon: 'Lock', permission: 'system:permission' }
      }
    ]
  },
  {
    path: '/supply',
    component: () => import('@/components/layout/index.vue'),
    meta: { title: '供应链管理', icon: 'Box' },
    children: [
      {
        path: 'product',
        name: 'SupplyProductManagement',
        component: () => import('@/views/supply/product/index.vue'),
        meta: { title: '产品管理', icon: 'Box', permission: 'supply:product' }
      },
      {
        path: 'category',
        name: 'SupplyCategoryManagement',
        component: () => import('@/views/supply/category/index.vue'),
        meta: { title: '分类管理', icon: 'FolderOpened', permission: 'supply:category' }
      }
    ]
  },
  {
    path: '/traceability',
    component: () => import('@/components/layout/index.vue'),
    meta: { title: '溯源管理', icon: 'DocumentChecked' },
    children: [
      {
        path: 'batch',
        name: 'BatchManagement',
        component: () => import('@/views/traceability/batch/index.vue'),
        meta: { title: '批次管理', icon: 'Files', permission: 'traceability:batch' }
      },
      {
        path: 'transport',
        name: 'TransportManagement',
        component: () => import('@/views/traceability/transport/index.vue'),
        meta: { title: '运输管理', icon: 'Van', permission: 'traceability:transport' }
      },
      {
        path: 'warehouse',
        name: 'WarehouseManagement',
        component: () => import('@/views/traceability/warehouse/index.vue'),
        meta: { title: '仓储管理', icon: 'Grid', permission: 'traceability:warehouse' }
      },
      {
        path: 'sales',
        name: 'SalesManagement',
        component: () => import('@/views/traceability/sales/index.vue'),
        meta: { title: '销售管理', icon: 'Shop', permission: 'traceability:sales' }
      },
      {
        path: 'query',
        name: 'TraceQuery',
        component: () => import('@/views/traceability/query/index.vue'),
        meta: { title: '溯源查询', icon: 'DocumentChecked', permission: 'traceability:query' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

setupRouterGuard(router)

export default router
