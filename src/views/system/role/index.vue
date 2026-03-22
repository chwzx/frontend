<template>
  <div class="role-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <div class="header-actions">
            <el-button
              v-if="selectedRoles.length > 0"
              type="danger"
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>
              批量删除 ({{ selectedRoles.length }})
            </el-button>
            <el-button
              v-if="selectedRoles.length > 0"
              type="warning"
              @click="handleBatchToggleStatus"
            >
              <el-icon><Switch /></el-icon>
              {{ allEnabled ? '批量禁用' : '批量启用' }}
            </el-button>
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新增角色
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="searchForm.keyword"
            placeholder="角色名称/编码"
            clearable
            style="width: 240px"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table
        :data="roleList"
        v-loading="loading"
        border
        @selection-change="handleSelectionChange"
        :row-key="(row: Role) => row.id"
        :tree-props="{ children: 'children' }"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="name" label="角色名称" min-width="120">
          <template #default="{ row }">
            <el-tag effect="plain" type="info">{{ row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="角色编码" min-width="140">
          <template #default="{ row }">
            <el-text type="primary" tag="code">{{ row.code }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
              {{ row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="权限数" width="80" align="center">
          <template #default="{ row }">
            <el-tag type="warning" size="small">{{ row.permissionCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="用户数" width="80" align="center">
          <template #default="{ row }">
            <el-tag type="success" size="small">{{ row.userCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="handlePermissions(row)" v-if="userStore.hasPermission('system:role:edit')">
              <el-icon><Lock /></el-icon>
              分配权限
            </el-button>
            <el-button size="small" link type="primary" @click="handleUsers(row)" v-if="userStore.hasPermission('system:role:query')">
              <el-icon><User /></el-icon>
              查看用户
            </el-button>
            <el-popconfirm
              :title="row.enabled ? '确定要禁用该角色吗？' : '确定要启用该角色吗？'"
              @confirm="handleToggleStatus(row)"
              v-if="userStore.hasPermission('system:role:edit')"
            >
              <template #reference>
                <el-button
                  size="small"
                  link
                  :type="row.enabled ? 'warning' : 'success'"
                >
                  <el-icon><Switch /></el-icon>
                  {{ row.enabled ? '禁用' : '启用' }}
                </el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm
              title="确定要删除该角色吗？删除后不可恢复！"
              @confirm="handleDelete(row)"
              v-if="userStore.hasPermission('system:role:delete')"
            >
              <template #reference>
                <el-button size="small" link type="danger">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        label-width="80px"
      >
        <el-form-item v-if="!isEdit" label="角色名称" prop="name">
          <el-input
            v-model="roleForm.name"
            placeholder="请输入角色名称"
            clearable
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="角色编码" prop="code">
          <el-input
            v-model="roleForm.code"
            placeholder="请输入角色编码（英文、数字、下划线）"
            clearable
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      v-model="permissionsDialogVisible"
      title="分配权限"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="permissions-dialog">
        <el-tree
          ref="permissionTreeRef"
          :data="permissionTree"
          :props="permissionTreeProps"
          node-key="id"
          show-checkbox
          :default-checked-keys="checkedPermissionIds"
          :load="loadPermissionNode"
          v-loading="permissionTreeLoading"
          class="permission-tree"
        >
          <template #default="{ node, data }">
            <span class="tree-node">
              <el-icon v-if="data.type === 'MENU'" class="icon-menu"><Menu /></el-icon>
              <el-icon v-else-if="data.type === 'BUTTON'" class="icon-button"><Operation /></el-icon>
              <el-icon v-else-if="data.type === 'API'" class="icon-api"><Connection /></el-icon>
              <el-icon v-else class="icon-data"><DataLine /></el-icon>
              <span class="node-label">{{ node.label }}</span>
              <el-tag v-if="data.type" size="small" effect="plain" class="type-tag">
                {{ getTypeLabel(data.type) }}
              </el-tag>
            </span>
          </template>
        </el-tree>
      </div>

      <template #footer>
        <el-button @click="permissionsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermissions" :loading="savePermissionsLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 角色用户对话框 -->
    <el-dialog
      v-model="usersDialogVisible"
      title="角色用户管理"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="users-dialog">
        <el-form :inline="true" class="user-search-form">
          <el-form-item label="搜索">
            <el-input
              v-model="userSearchForm.keyword"
              placeholder="用户名/昵称"
              clearable
              style="width: 200px"
              @clear="fetchRoleUsers"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchRoleUsers">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
          </el-form-item>
        </el-form>

        <el-table :data="roleUsers" v-loading="usersLoading" border>
          <el-table-column prop="username" label="用户名" min-width="140" align="center">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div class="user-avatar">
                  {{ row.nickname.charAt(0) || row.username.charAt(0) }}
                </div>
                <span>{{ row.username }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="nickname" label="昵称" min-width="120" align="center" />
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-popconfirm
                title="确定要从该角色移除此用户吗？"
                @confirm="handleRemoveUser(row.id)"
              >
                <template #reference>
                  <el-button size="small" link type="danger">
                    <el-icon><Delete /></el-icon>
                    移除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="userPagination.pageNum"
          v-model:page-size="userPagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="userPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchRoleUsers"
          @current-change="fetchRoleUsers"
          style="margin-top: 15px; justify-content: flex-end"
        />
      </div>

      <template #footer>
        <el-button type="primary" @click="handleAddUserToRole">
          <el-icon><UserFilled /></el-icon>
          添加用户
        </el-button>
        <el-button @click="usersDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="addUserDialogVisible"
      title="添加用户到角色"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="addUserFormRef" :model="addUserForm" label-width="80px">
        <el-form-item label="选择用户">
          <el-select
            v-model="addUserForm.userId"
            placeholder="请选择用户"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in allUsers"
              :key="user.id"
              :label="`${user.nickname} (@${user.username})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addUserDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAddUser" :loading="addUserLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  Edit,
  Delete,
  Switch,
  Lock,
  User,
  CopyDocument,
  Menu,
  Operation,
  Connection,
  DataLine,
  UserFilled
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 权限检查计算属性 - 使用箭头函数确保总是获取最新值
const canAddRole = computed(() => {
  const result = userStore.hasPermission('system:role:add')
  console.log('canAddRole 计算:', result, 'permissions:', userStore.permissions)
  return result
})
const canEditRole = computed(() => {
  const result = userStore.hasPermission('system:role:edit')
  console.log('canEditRole 计算:', result)
  return result
})
const canQueryRoleUsers = computed(() => userStore.hasPermission('system:role:query'))
const canDeleteRole = computed(() => userStore.hasPermission('system:role:delete'))

// 调试：输出 userStore 信息
console.log('=== 角色管理页面加载 ===')
console.log('userStore.permissions:', userStore.permissions)
console.log('canAddRole.value:', canAddRole.value)
console.log('canEditRole.value:', canEditRole.value)
console.log('canQueryRoleUsers.value:', canQueryRoleUsers.value)
console.log('canDeleteRole.value:', canDeleteRole.value)

import {
  getRoleList,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  updateRoleStatus,
  batchDeleteRoles,
  batchUpdateStatus,
  assignRolePermissions,
  getRolePermissions,
  getRoleTree,
  copyRole,
  getRoleAssignedUsers,
  getUserRoles,
  removeRoleFromUser,
  type Role,
  type RoleCreateParams,
  type RoleUpdateParams,
  type BatchRoleParams
} from '@/api/role'
import { getPermissionTree } from '@/api/permission'
import { getUserList } from '@/api/user'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const roleFormRef = ref<FormInstance>()
const submitLoading = ref(false)

// 批量操作相关
const selectedRoles = ref<Role[]>([])
const allEnabled = ref(true)

// 权限分配相关
const permissionsDialogVisible = ref(false)
const permissionTreeRef = ref()
const permissionTreeLoading = ref(false)
const savePermissionsLoading = ref(false)
const currentRoleId = ref<number>(0)
const checkedPermissionIds = ref<number[]>([])
const permissionTree = ref<any[]>([])
const permissionTreeProps = {
  children: 'children',
  label: 'name'
}

// 角色用户相关
const usersDialogVisible = ref(false)
const usersLoading = ref(false)
const roleUsers = ref<any[]>([])
const userPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})
const userSearchForm = reactive({
  keyword: ''
})

// 添加用户相关
const addUserDialogVisible = ref(false)
const addUserFormRef = ref<FormInstance>()
const addUserLoading = ref(false)
const addUserForm = reactive({
  userId: undefined as number | undefined
})
const allUsers = ref<any[]>([])

const searchForm = reactive({
  keyword: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const roleList = ref<Role[]>([])

const roleForm = reactive<RoleCreateParams | RoleUpdateParams>({
  name: '',
  code: '',
  description: ''
})

// 验证角色编码
const validateRoleCode = (rule: any, value: string, callback: any) => {
  if (!value) {
    return callback()
  }
  const codeRegex = /^[a-zA-Z0-9_]+$/
  if (!codeRegex.test(value)) {
    callback(new Error('角色编码只能包含英文、数字和下划线'))
  } else {
    callback()
  }
}

const roleRules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在 2-20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '角色编码只能包含英文、数字和下划线', trigger: 'blur' },
    { min: 2, max: 30, message: '角色编码长度在 2-30 个字符', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 获取权限类型标签
const getTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    MENU: '菜单',
    BUTTON: '按钮',
    API: '接口',
    DATA: '数据'
  }
  return typeMap[type] || type
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRoleList({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword
    })
    roleList.value = res.data?.records || []
    pagination.total = res.data?.total || 0
  } catch (error) {
    // 错误已在拦截器处理
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  handleSearch()
}

const handleSelectionChange = (selection: Role[]) => {
  selectedRoles.value = selection
  if (selection.length > 0) {
    allEnabled.value = selection.every(r => r.enabled)
  }
}

const handleCreate = () => {
  isEdit.value = false
  dialogTitle.value = '新增角色'
  roleForm.name = ''
  roleForm.code = ''
  roleForm.description = ''
  dialogVisible.value = true
}

const handleEdit = async (row: Role) => {
  isEdit.value = true
  dialogTitle.value = '编辑角色'
  try {
    const res = await getRole(row.id)
    const data = res.data || res
    roleForm.name = data.name
    roleForm.code = data.code
    roleForm.description = data.description || ''
    dialogVisible.value = true
  } catch (error) {
    // 错误已在拦截器处理
  }
}

const handleSubmit = async () => {
  if (!roleFormRef.value) return

  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          await updateRole(0, roleForm as RoleUpdateParams)
          ElMessage.success('更新成功')
        } else {
          await createRole(roleForm as RoleCreateParams)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        // 错误已在拦截器处理
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleToggleStatus = async (row: Role) => {
  try {
    await updateRoleStatus(row.id, !row.enabled)
    ElMessage.success(`角色${row.enabled ? '禁用' : '启用'}成功`)
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleBatchToggleStatus = async () => {
  const newStatus = !allEnabled.value
  try {
    const data: BatchRoleParams = {
      roleIds: selectedRoles.value.map(r => r.id),
      enabled: newStatus
    }
    await batchUpdateStatus(data)
    ElMessage.success(`批量${newStatus ? '启用' : '禁用'}成功`)
    selectedRoles.value = []
    fetchData()
  } catch (error) {
    ElMessage.error('批量操作失败')
  }
}

const handleDelete = async (row: Role) => {
  try {
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRoles.value.length} 个角色吗？删除后不可恢复！`,
      '警告',
      { type: 'warning' }
    )
    const roleIds = selectedRoles.value.map(r => r.id)
    await batchDeleteRoles(roleIds)
    ElMessage.success('批量删除成功')
    selectedRoles.value = []
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleCopy = async (row: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定要复制角色 "${row.name}" 吗？`,
      '复制角色',
      { type: 'info' }
    )
    const newRoleName = `${row.name}_副本`
    const newRoleCode = `${row.code}_copy`
    const data: RoleCreateParams = {
      name: newRoleName,
      code: newRoleCode,
      description: `复制自 ${row.name}`
    }
    await copyRole(row.id, data)
    ElMessage.success('复制成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('复制失败')
    }
  }
}

// 权限分配相关方法
const handlePermissions = async (row: Role) => {
  currentRoleId.value = row.id
  checkedPermissionIds.value = []
  permissionTree.value = []

  try {
    permissionTreeLoading.value = true
    const res = await getPermissionTree()
    permissionTree.value = res.data || []

    const res2 = await getRolePermissions(row.id)
    checkedPermissionIds.value = res2.data || []

    permissionsDialogVisible.value = true
  } catch (error) {
    // 错误已在拦截器处理
  } finally {
    permissionTreeLoading.value = false
  }
}

const loadPermissionNode = async (node: any, resolve: any) => {
  if (node.level === 0) {
    resolve(permissionTree.value)
  } else {
    if (node.data.children && node.data.children.length > 0) {
      resolve(node.data.children)
    } else {
      resolve([])
    }
  }
}

const handleSavePermissions = async () => {
  if (!permissionTreeRef.value) return
  
  savePermissionsLoading.value = true
  try {
    const checkedKeys = permissionTreeRef.value.getCheckedKeys() as number[]
    const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys() as number[]
    const allPermissionIds = [...checkedKeys, ...halfCheckedKeys]
    
    await assignRolePermissions(currentRoleId.value, allPermissionIds)
    ElMessage.success('权限分配成功')
    permissionsDialogVisible.value = false
  } catch (error) {
    ElMessage.error('权限分配失败')
  } finally {
    savePermissionsLoading.value = false
  }
}

// 角色用户相关方法
const handleUsers = async (row: Role) => {
  currentRoleId.value = row.id
  userPagination.pageNum = 1
  userSearchForm.keyword = ''
  await fetchRoleUsers()
  usersDialogVisible.value = true
}

const fetchRoleUsers = async () => {
  usersLoading.value = true
  try {
    const data = await getRoleAssignedUsers(currentRoleId.value, {
      pageNum: userPagination.pageNum,
      pageSize: userPagination.pageSize,
      keyword: userSearchForm.keyword
    })
    roleUsers.value = data.records
    userPagination.total = data.total
  } catch (error) {
    // 错误已在拦截器处理
  } finally {
    usersLoading.value = false
  }
}

const handleRemoveUser = async (userId: number) => {
  try {
    await removeRoleFromUser(userId, currentRoleId.value)
    ElMessage.success('移除成功')
    fetchRoleUsers()
  } catch (error) {
    ElMessage.error('移除失败')
  }
}

const handleAddUserToRole = async () => {
  try {
    // 获取所有用户列表
    const data = await getUserList({ pageNum: 1, pageSize: 1000 })
    allUsers.value = data.records
    addUserDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

const handleConfirmAddUser = async () => {
  if (!addUserForm.userId) {
    ElMessage.warning('请选择用户')
    return
  }
  
  addUserLoading.value = true
  try {
    await assignRolesToUser({
      userId: addUserForm.userId,
      roleIds: [currentRoleId.value]
    })
    ElMessage.success('添加成功')
    addUserDialogVisible.value = false
    addUserForm.userId = undefined
    fetchRoleUsers()
  } catch (error) {
    ElMessage.error('添加失败')
  } finally {
    addUserLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.role-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.card-header span {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
  padding: 15px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

/* 卡片样式 */
:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
}

:deep(.el-card__header) {
  background: #ffffff;
  padding: 18px 20px;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-card__header .card-header span) {
  color: #303133;
}

/* 表格样式 */
:deep(.el-table) {
  border-radius: 4px;
  overflow: hidden;
  font-size: 14px;
}

:deep(.el-table th) {
  background: #fafafa;
  color: #606266;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-table td) {
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-table tr:hover) {
  background-color: #f5f7fa;
}

:deep(.el-table__row) {
  transition: all 0.2s ease;
}

/* 按钮样式 */
:deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 500;
  color: #ffffff;
  transition: all 0.3s ease;
}

:deep(.el-button--primary:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
  color: #ffffff;
}

:deep(.el-button--success) {
  background-color: #67c23a;
  border-color: #67c23a;
  border-radius: 4px;
  color: #ffffff;
}

:deep(.el-button--success:hover) {
  background-color: #85ce61;
  border-color: #85ce61;
  color: #ffffff;
}

:deep(.el-button--warning) {
  background-color: #e6a23c;
  border-color: #e6a23c;
  border-radius: 4px;
  color: #ffffff;
}

:deep(.el-button--warning:hover) {
  background-color: #ebb563;
  border-color: #ebb563;
  color: #ffffff;
}

:deep(.el-button--danger) {
  background-color: #f56c6c;
  border-color: #f56c6c;
  border-radius: 4px;
  color: #ffffff;
}

:deep(.el-button--danger:hover) {
  background-color: #f78989;
  border-color: #f78989;
  color: #ffffff;
}

/* 分页样式 */
:deep(.el-pagination) {
  padding: 15px 0;
  justify-content: flex-end;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 4px;
  margin: 0 2px;
  transition: all 0.3s ease;
}

:deep(.el-pagination .el-pager li:hover) {
  color: #409eff;
}

:deep(.el-pagination .el-pager li.active) {
  background-color: #409eff;
  color: #ffffff;
}

/* 权限对话框样式 */
.permissions-dialog {
  max-height: 400px;
  overflow-y: auto;
}

.permission-tree {
  margin-top: 10px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-menu,
.icon-button,
.icon-api,
.icon-data {
  color: #409eff;
}

.node-label {
  margin-right: 4px;
}

.type-tag {
  margin-left: auto;
}

/* 用户对话框样式 */
.users-dialog {
  max-height: 500px;
  overflow-y: auto;
}

.user-search-form {
  margin-bottom: 15px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

/* 用户头像样式 */
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}
</style>
