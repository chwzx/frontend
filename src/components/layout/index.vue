<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="layout-aside">
      <div class="logo">
        <h2>生鲜冷链溯源管理系统</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <!-- 仪表盘 -->
        <el-menu-item index="/dashboard" v-if="userStore.hasPermission('system')">
          <el-icon><DataAnalysis /></el-icon>
          <span>首页</span>
        </el-menu-item>

        <!-- 系统管理 -->
        <el-sub-menu index="/system" v-if="hasSystemMenu">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>

          <el-menu-item index="/system/user" v-if="userStore.hasPermission('system:user')">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>

          <el-menu-item index="/system/role" v-if="userStore.hasPermission('system:role')">
            <el-icon><Avatar /></el-icon>
            <span>角色管理</span>
          </el-menu-item>

          <el-menu-item index="/system/permission" v-if="userStore.hasPermission('system:permission')">
            <el-icon><Lock /></el-icon>
            <span>权限管理</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 供应链管理 -->
        <el-sub-menu index="/supply" v-if="hasSupplyMenu">
          <template #title>
            <el-icon><Box /></el-icon>
            <span>供应链管理</span>
          </template>

          <el-menu-item index="/supply/supplier" v-if="userStore.hasPermission('supply:supplier') || userStore.hasPermission('supply:supplier:query') || userStore.hasPermission('supply:supplier:add')">
            <el-icon><UserFilled /></el-icon>
            <span>供应商管理</span>
          </el-menu-item>

          <el-menu-item index="/supply/product" v-if="userStore.hasPermission('supply:product') || userStore.hasPermission('supply:product:query') || userStore.hasPermission('supply:product:add')">
            <el-icon><Box /></el-icon>
            <span>产品管理</span>
          </el-menu-item>

          <el-menu-item index="/supply/category" v-if="userStore.hasPermission('supply:category') || userStore.hasPermission('supply:category:query') || userStore.hasPermission('supply:category:add')">
            <el-icon><FolderOpened /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 溯源管理 -->
        <el-sub-menu index="/traceability" v-if="hasTraceabilityMenu">
          <template #title>
            <el-icon><DocumentChecked /></el-icon>
            <span>溯源管理</span>
          </template>

          <el-menu-item index="/traceability/batch" v-if="userStore.hasPermission('traceability:batch')">
            <el-icon><Files /></el-icon>
            <span>批次管理</span>
          </el-menu-item>

          <el-menu-item index="/traceability/transport" v-if="userStore.hasPermission('traceability:transport')">
            <el-icon><Van /></el-icon>
            <span>运输管理</span>
          </el-menu-item>

          <el-menu-item index="/traceability/warehouse" v-if="userStore.hasPermission('traceability:warehouse')">
            <el-icon><Grid /></el-icon>
            <span>仓储管理</span>
          </el-menu-item>

          <el-menu-item index="/traceability/sales" v-if="userStore.hasPermission('traceability:sales')">
            <el-icon><Shop /></el-icon>
            <span>销售管理</span>
          </el-menu-item>

          <el-menu-item index="/traceability/query" v-if="userStore.hasPermission('traceability:query')">
            <el-icon><DocumentChecked /></el-icon>
            <span>溯源查询</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon
            class="collapse-icon"
            @click="toggleCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span>{{ userStore.userInfo?.nickname || '用户' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Fold, Expand, DataAnalysis, Setting, User, UserFilled, Avatar, Lock, SwitchButton, DocumentChecked, Box, Files, Van, Shop, Grid, FolderOpened } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

// 检查是否有系统管理菜单（至少有一个子菜单权限）
const hasSystemMenu = computed(() => {
  return userStore.hasPermission('system:user') ||
         userStore.hasPermission('system:role') ||
         userStore.hasPermission('system:permission')
})

// 检查是否有供应链管理菜单（至少有一个子菜单权限）
const hasSupplyMenu = computed(() => {
  const hasSupplierPermission = userStore.hasPermission('supply:supplier') ||
                                userStore.hasPermission('supply:supplier:query') ||
                                userStore.hasPermission('supply:supplier:add') ||
                                userStore.hasPermission('supply:supplier:edit') ||
                                userStore.hasPermission('supply:supplier:delete')
  const hasProductPermission = userStore.hasPermission('supply:product') ||
                               userStore.hasPermission('supply:product:query') ||
                               userStore.hasPermission('supply:product:add') ||
                               userStore.hasPermission('supply:product:edit') ||
                               userStore.hasPermission('supply:product:delete')
  const hasCategoryPermission = userStore.hasPermission('supply:category') ||
                                userStore.hasPermission('supply:category:query') ||
                                userStore.hasPermission('supply:category:add') ||
                                userStore.hasPermission('supply:category:edit') ||
                                userStore.hasPermission('supply:category:delete')

  return hasSupplierPermission || hasProductPermission || hasCategoryPermission
})

// 检查是否有溯源管理菜单（至少有一个子菜单权限）
const hasTraceabilityMenu = computed(() => {
  return userStore.hasPermission('traceability:batch') ||
         userStore.hasPermission('traceability:transport') ||
         userStore.hasPermission('traceability:warehouse') ||
         userStore.hasPermission('traceability:sales') ||
         userStore.hasPermission('traceability:query')
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        type: 'warning'
      })
      await userStore.logoutUser()
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch (error) {
      // 用户取消
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4b;
}

.logo h2 {
  color: #fff;
  font-size: 16px;
  margin: 0;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.layout-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
