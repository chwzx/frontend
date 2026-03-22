<template>
  <div class="category-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>产品分类管理</span>
          <el-button
            type="primary"
            @click="handleCreate"
            v-if="userStore.hasPermission('supply:category:add') || userStore.hasPermission('traceability:product:add')"
          >
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>
      </template>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="分类名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="code" label="分类编码" width="120" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="enabled" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">
              {{ row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              size="small"
              link
              type="primary"
              @click="handleEdit(row)"
              v-if="userStore.hasPermission('supply:category:edit') || userStore.hasPermission('traceability:product:edit')"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除该分类吗？"
              @confirm="handleDelete(row)"
              v-if="userStore.hasPermission('supply:category:delete') || userStore.hasPermission('traceability:product:delete')"
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
    </el-card>

    <!-- 分类表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入分类编码" />
        </el-form-item>
        <el-form-item label="父级分类" prop="parentId">
          <el-select
            v-model="formData.parentId"
            placeholder="请选择父级分类（可选）"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            :min="0"
            :max="999"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-switch
            v-model="formData.enabled"
            active-text="启用"
            inactive-text="禁用"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/api/traceability'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

interface Category {
  id: number
  name: string
  code: string
  parentId: number | null
  icon: string | null
  sort: number
  description: string | null
  enabled: boolean
  createTime: string
  updateTime: string
  children?: Category[]
}

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const formRef = ref<FormInstance>()

// 表格数据
const tableData = ref<Category[]>([])

// 表单数据
const formData = reactive({
  id: undefined as number | undefined,
  name: '',
  code: '',
  parentId: undefined as number | undefined,
  sort: 0,
  description: '',
  enabled: true
})

// 表单验证规则
const formRules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入分类编码', trigger: 'blur' }]
}

// 分类选项（用于父级分类选择）
const categoryOptions = computed(() => {
  const options: Array<{ value: number; label: string }> = []
  const buildOptions = (categories: Category[], level = 0) => {
    categories.forEach(cat => {
      const prefix = '├─ '.repeat(level)
      options.push({
        value: cat.id,
        label: prefix + cat.name
      })
      if (cat.children && cat.children.length > 0) {
        buildOptions(cat.children, level + 1)
      }
    })
  }
  buildOptions(tableData.value)
  return options
})

// 获取分类列表（树形结构）
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCategories()
    // 响应拦截器返回的是完整响应对象 { code, message, data }
    const data = res.data || []
    tableData.value = buildTree(data)
  } catch (error: any) {
    console.error('获取分类列表失败:', error)
    ElMessage.error(error.message || '获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 构建树形结构
const buildTree = (items: Category[]): Category[] => {
  const rootItems: Category[] = []
  const itemMap = new Map<number, Category>()

  // 创建所有节点的映射
  items.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] })
  })

  // 构建树形结构
  items.forEach(item => {
    const node = itemMap.get(item.id)!
    if (item.parentId && item.parentId !== 0 && itemMap.has(item.parentId)) {
      const parent = itemMap.get(item.parentId)!
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(node)
    } else {
      rootItems.push(node)
    }
  })

  return rootItems
}

// 新增
const handleCreate = () => {
  dialogTitle.value = '新增分类'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Category) => {
  dialogTitle.value = '编辑分类'
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    code: row.code,
    parentId: row.parentId === 0 ? undefined : row.parentId,
    sort: row.sort,
    description: row.description,
    enabled: row.enabled
  })
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: Category) => {
  try {
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    console.error('删除失败:', error)
    ElMessage.error(error.message || '删除失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const data = {
          ...formData,
          parentId: formData.parentId || undefined
        }
        
        if (formData.id) {
          await updateCategory(formData.id, data)
          ElMessage.success('更新成功')
        } else {
          await createCategory(data)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error: any) {
        console.error('提交失败:', error)
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    name: '',
    code: '',
    parentId: undefined,
    sort: 0,
    description: '',
    enabled: true
  })
  formRef.value?.clearValidate()
}

// 关闭对话框
const handleDialogClose = () => {
  resetForm()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.category-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
