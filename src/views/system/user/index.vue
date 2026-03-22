<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleCreate" v-permission="'system:user:add'" class="white-text-btn">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="searchForm.keyword"
            placeholder="用户名/昵称"
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
      <el-table :data="userList" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="username" label="用户" min-width="120" align="center">
          <template #default="{ row }">
            <div class="username-cell">
              <div class="user-avatar">
                {{ row.nickname.charAt(0) || row.username.charAt(0) }}
              </div>
              <div class="user-info">
                <div class="user-name">{{ row.nickname }}</div>
                <div class="user-code">@{{ row.username }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="130" align="center" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="130" align="center" />
        <el-table-column label="角色" min-width="150" align="center">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.id"
              size="small"
              effect="plain"
              style="margin-right: 4px;"
            >
              {{ role.name }}
            </el-tag>
            <span v-if="!row.roles || row.roles.length === 0" style="color: #909399; font-size: 12px;">
              无角色
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="160" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              active-text="启用"
              inactive-text="禁用"
              @change="handleToggleStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="handleEdit(row)" v-permission="'system:user:edit'">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-popconfirm
              :title="row.enabled ? '确定要禁用该用户吗？' : '确定要启用该用户吗？'"
              @confirm="handleToggleStatus(row)"
              v-permission="'system:user:edit'"
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
              title="确定要删除该用户吗？删除后不可恢复！"
              @confirm="handleDelete(row)"
              v-permission="'system:user:delete'"
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

    <!-- 用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="80px"
      >
        <el-form-item v-if="!isEdit" label="用户名" prop="username">
          <el-input
            v-model="userForm.username"
            placeholder="请输入用户名（英文、数字、下划线）"
            clearable
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码（6-20 位）"
            show-password
            clearable
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="userForm.nickname"
            placeholder="请输入昵称"
            clearable
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="userForm.email"
            placeholder="请输入邮箱"
            clearable
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="userForm.phone"
            placeholder="请输入手机号"
            clearable
            maxlength="11"
          />
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select
            v-model="userForm.roleIds"
            placeholder="请选择角色"
            multiple
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="role in allRoles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  Edit,
  Delete,
  Switch
} from '@element-plus/icons-vue'
import {
  getUserList,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  type User,
  type UserCreateParams,
  type UserUpdateParams,
  type Role
} from '@/api/user'
import { getAllRoles } from '@/api/role'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const userFormRef = ref<FormInstance>()
const submitLoading = ref(false)
const currentUserId = ref<number>(0)

const allRoles = ref<Role[]>([])

const searchForm = reactive({
  keyword: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const userList = ref<User[]>([])

const userForm = reactive<UserCreateParams | UserUpdateParams>({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  password: '',
  roleIds: []
})

// 验证手机号
const validatePhone = (rule: any, value: string, callback: any) => {
  if (!value) {
    return callback()
  }
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

// 验证邮箱
const validateEmail = (rule: any, value: string, callback: any) => {
  if (!value) {
    return callback()
  }
  const emailRegex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
  if (!emailRegex.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
  } else {
    callback()
  }
}

const userRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含英文、数字和下划线', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2-20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2-20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6-20 个字符', trigger: 'blur' }
  ],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword
    })
    userList.value = res.data?.records || []
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

const handleCreate = () => {
  isEdit.value = false
  currentUserId.value = 0
  dialogTitle.value = '新增用户'
  userForm.username = ''
  userForm.nickname = ''
  userForm.email = ''
  userForm.phone = ''
  userForm.password = ''
  userForm.roleIds = []
  dialogVisible.value = true
}

const handleEdit = async (row: User) => {
  isEdit.value = true
  currentUserId.value = row.id
  dialogTitle.value = '编辑用户'
  userForm.nickname = row.nickname
  userForm.email = row.email || ''
  userForm.phone = row.phone || ''
  // 加载用户的角色
  try {
    const res = await getUser(row.id)
    const data = res.data || res
    userForm.roleIds = data.roleIds || []
  } catch (error) {
    // 错误已在拦截器处理
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!userFormRef.value) return

  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          const { nickname, email, phone, roleIds } = userForm as UserUpdateParams
          await updateUser(currentUserId.value, { nickname, email, phone, roleIds })
          ElMessage.success('更新成功')
        } else {
          await createUser(userForm as UserCreateParams)
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

const handleToggleStatus = async (row: User) => {
  try {
    await updateUserStatus(row.id, !row.enabled)
    ElMessage.success(`用户${row.enabled ? '禁用' : '启用'}成功`)
    fetchData()
  } catch (error) {
    row.enabled = !row.enabled
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (row: User) => {
  try {
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  fetchData()
  loadAllRoles()
})

const loadAllRoles = async () => {
  try {
    const res = await getAllRoles()
    allRoles.value = res.data || []
  } catch (error) {
    // 错误已在拦截器处理
  }
}
</script>

<style scoped>
.user-management {
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

.white-text-btn {
  --el-button-text-color: #ffffff;
  color: #ffffff;
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

/* 用户头像列样式 */
:deep(.el-table .username-cell) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

:deep(.el-table .user-avatar) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

:deep(.el-table .user-info) {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

:deep(.el-table .user-name) {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

:deep(.el-table .user-code) {
  font-size: 12px;
  color: #909399;
  font-family: 'Courier New', monospace;
}

/* 状态开关样式 */
:deep(.el-table .el-switch) {
  --el-switch-on-color: #67c23a;
  --el-switch-off-color: #f56c6c;
}

/* 操作按钮样式 */
:deep(.el-table .el-button--small) {
  padding: 6px 12px;
  margin: 0 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

:deep(.el-table .el-button--small:hover) {
  opacity: 0.8;
}

/* 标签样式 */
:deep(.el-tag) {
  border-radius: 4px;
  padding: 4px 12px;
  font-weight: 500;
}

:deep(.el-tag--plain) {
  background-color: #ecf5ff;
  color: #409eff;
  border-color: #b3d8ff;
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

/* 搜索表单输入框样式 */
:deep(.search-form .el-input__wrapper) {
  border-radius: 4px;
  box-shadow: none;
  transition: all 0.3s ease;
}

:deep(.search-form .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.search-form .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
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

:deep(.el-button--primary.is-disabled) {
  opacity: 0.6;
  color: #ffffff;
}
</style>
