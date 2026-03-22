<template>
  <div class="permission-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate" v-if="userStore.hasPermission('system:permission:add')">
              <el-icon><Plus /></el-icon>
              新增权限
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="搜索">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索权限名称或编码"
            clearable
            style="width: 240px"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="权限类型">
          <el-select
            v-model="filterType"
            placeholder="全部类型"
            clearable
            style="width: 140px"
            @change="handleSearch"
          >
            <el-option label="菜单" value="MENU" />
            <el-option label="按钮" value="BUTTON" />
            <el-option label="接口" value="API" />
            <el-option label="数据" value="DATA" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 权限树 -->
      <el-tree
        ref="treeRef"
        :data="filteredPermissionTree"
        :props="treeProps"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        :load="loadNode"
        v-loading="loading"
        class="permission-tree"
      >
        <template #default="{ node, data }">
          <span class="tree-node" @contextmenu.prevent="handleContextMenu($event, data)">
            <el-icon v-if="data.type === 'MENU'" class="icon-menu"><Menu /></el-icon>
            <el-icon v-else-if="data.type === 'BUTTON'" class="icon-button"><Operation /></el-icon>
            <el-icon v-else-if="data.type === 'API'" class="icon-api"><Connection /></el-icon>
            <el-icon v-else class="icon-data"><DataLine /></el-icon>
            <span class="node-label">{{ node.label }}</span>
            <el-tag v-if="data.type" size="small" effect="plain" class="type-tag">
              {{ getTypeLabel(data.type) }}
            </el-tag>
            <span class="tree-code">{{ data.code }}</span>
            <span class="node-actions" v-show="node.isCurrent">
              <el-button type="primary" link size="small" @click.stop="handleEdit(data)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-popconfirm
                title="确定要删除该权限吗？删除后不可恢复！"
                @confirm="handleDelete(data)"
              >
                <template #reference>
                  <el-button type="danger" link size="small">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </span>
          </span>
        </template>
      </el-tree>
    </el-card>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.visible"
      ref="contextMenuRef"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <div class="context-menu-item" @click="handleContextMenuEdit" v-if="userStore.hasPermission('system:permission:edit')">
        <el-icon><Edit /></el-icon>
        <span>编辑权限</span>
      </div>
      <el-divider style="margin: 4px 0" v-if="userStore.hasPermission('system:permission:edit') && userStore.hasPermission('system:permission:delete')" />
      <div class="context-menu-item danger" @click="handleContextMenuDelete" v-if="userStore.hasPermission('system:permission:delete')">
        <el-icon><Delete /></el-icon>
        <span>删除权限</span>
      </div>
    </div>
    
    <!-- 权限对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form
        ref="permissionFormRef"
        :model="permissionForm"
        :rules="permissionRules"
        label-width="80px"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
          <el-input v-model="permissionForm.code" placeholder="请输入权限编码" />
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-select v-model="permissionForm.type" placeholder="请选择权限类型">
            <el-option label="菜单" value="MENU" />
            <el-option label="按钮" value="BUTTON" />
            <el-option label="接口" value="API" />
            <el-option label="数据" value="DATA" />
          </el-select>
        </el-form-item>
        <el-form-item label="父级权限" prop="parentId">
          <el-cascader
            v-model="permissionForm.parentId"
            :options="permissionTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择父级权限"
            clearable
          />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="permissionForm.path" placeholder="请输入路径" />
        </el-form-item>
        <el-form-item label="组件" prop="component">
          <el-input v-model="permissionForm.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="permissionForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="permissionForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Menu,
  Operation,
  Lock,
  Plus,
  Search,
  Refresh,
  Edit,
  Delete,
  Connection,
  DataLine
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import {
  getPermissionTree,
  createPermission,
  updatePermission,
  deletePermission,
  type Permission,
  type PermissionCreateParams,
  type PermissionUpdateParams
} from '@/api/permission'

const userStore = useUserStore()

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const permissionFormRef = ref<FormInstance>()
const treeRef = ref()
const contextMenuRef = ref()

// 搜索和过滤
const searchKeyword = ref('')
const filterType = ref('')
const filteredPermissionTree = computed(() => {
  if (!searchKeyword.value && !filterType.value) {
    return permissionTree.value
  }
  return filterTree(permissionTree.value)
})

const filterTree = (nodes: Permission[]): Permission[] => {
  return nodes
    .map(node => {
      const matchKeyword =
        !searchKeyword.value ||
        node.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        node.code.toLowerCase().includes(searchKeyword.value.toLowerCase())
      const matchType = !filterType.value || node.type === filterType.value

      const children = node.children ? filterTree(node.children) : []

      if (matchKeyword && matchType) {
        return { ...node, children }
      }

      if (children.length > 0) {
        return { ...node, children }
      }

      return null
    })
    .filter((node): node is Permission => node !== null)
}

// 右键菜单
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  currentNode: null as Permission | null
})

const hideContextMenu = () => {
  contextMenu.value.visible = false
  contextMenu.value.currentNode = null
}

const handleContextMenu = (event: MouseEvent, data: Permission) => {
  contextMenu.value.x = event.clientX
  contextMenu.value.y = event.clientY
  contextMenu.value.currentNode = data
  contextMenu.value.visible = true
}

const handleContextMenuEdit = () => {
  if (contextMenu.value.currentNode) {
    handleEdit(contextMenu.value.currentNode!)
  }
  hideContextMenu()
}

const handleContextMenuDelete = () => {
  if (contextMenu.value.currentNode) {
    handleDelete(contextMenu.value.currentNode!)
  }
  hideContextMenu()
}

// 点击其他地方隐藏右键菜单
const handleClickOutside = (event: MouseEvent) => {
  if (contextMenuRef.value && !contextMenuRef.value.contains(event.target as Node)) {
    hideContextMenu()
  }
}

const treeProps = {
  children: 'children',
  label: 'name'
}

const permissionTree = ref<Permission[]>([])

const permissionForm = reactive<PermissionCreateParams | PermissionUpdateParams>({
  name: '',
  code: '',
  type: 'MENU',
  parentId: undefined,
  path: '',
  component: '',
  sort: 0,
  description: ''
})

const permissionRules: FormRules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限编码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择权限类型', trigger: 'change' }]
}

// 获取权限类型标签
const getTypeLabel = (type: string): string => {
  const typeMap: Record<string, { label: string; color: string }> = {
    MENU: { label: '菜单', color: '' },
    BUTTON: { label: '按钮', color: '' },
    API: { label: '接口', color: '' },
    DATA: { label: '数据', color: '' }
  }
  return typeMap[type]?.label || type
}

// 懒加载节点
const loadNode = async (node: any, resolve: any) => {
  if (node.level === 0) {
    const res = await getPermissionTree()
    resolve(res.data || [])
  } else {
    // 如果有子节点，则加载
    if (node.data.children && node.data.children.length > 0) {
      resolve(node.data.children)
    } else {
      resolve([])
    }
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getPermissionTree()
    // 响应拦截器返回的是完整响应对象 { code, message, data }
    permissionTree.value = res.data || []
  } catch (error) {
    // 错误已在拦截器处理
    permissionTree.value = []
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  // 过滤已在 computed 中处理
}

// 重置
const handleReset = () => {
  searchKeyword.value = ''
  filterType.value = ''
}

const handleCreate = () => {
  isEdit.value = false
  dialogTitle.value = '新增权限'
  permissionForm.name = ''
  permissionForm.code = ''
  permissionForm.type = 'MENU'
  permissionForm.parentId = undefined
  permissionForm.path = ''
  permissionForm.component = ''
  permissionForm.sort = 0
  permissionForm.description = ''
  dialogVisible.value = true
}

const handleEdit = (data: Permission) => {
  isEdit.value = true
  dialogTitle.value = '编辑权限'
  permissionForm.name = data.name
  permissionForm.code = data.code
  permissionForm.type = data.type
  permissionForm.parentId = data.parentId
  permissionForm.path = data.path || ''
  permissionForm.component = data.component || ''
  permissionForm.sort = data.sort || 0
  permissionForm.description = data.description || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!permissionFormRef.value) return

  await permissionFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updatePermission(0, permissionForm as PermissionUpdateParams)
          ElMessage.success('更新成功')
        } else {
          await createPermission(permissionForm as PermissionCreateParams)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        // 错误已在拦截器处理
      }
    }
  })
}

const handleDelete = async (data: Permission) => {
  try {
    await ElMessageBox.confirm('确定要删除该权限吗？删除后不可恢复！', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await deletePermission(data.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  fetchData()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.permission-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-form {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.permission-tree {
  margin-top: 10px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.3s;
  flex: 1;
}

.tree-node:hover {
  background: #f5f7fa;
}

.tree-node .el-icon {
  font-size: 16px;
  color: #409eff;
}

.icon-menu {
  color: #409eff;
}

.icon-button {
  color: #67c23a;
}

.icon-api {
  color: #e6a23c;
}

.icon-data {
  color: #f56c6c;
}

.node-label {
  flex: 1;
  font-weight: 500;
}

.type-tag {
  margin-left: 8px;
  font-size: 11px;
  padding: 0 6px;
}

.tree-code {
  color: #909399;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.node-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tree-node:hover .node-actions {
  opacity: 1;
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  min-width: 120px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
  color: #333;
}

.context-menu-item:hover {
  background: #f5f7fa;
}

.context-menu-item.danger {
  color: #f56c6c;
}

.context-menu-item.danger:hover {
  background: #fef0f0;
}

.el-divider {
  margin: 4px 0;
}
</style>
