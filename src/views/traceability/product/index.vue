<template>
  <div class="product-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>产品管理</span>
          <el-button
            type="primary"
            @click="handleCreate"
            v-if="userStore.hasPermission('supply:product:add') || userStore.hasPermission('traceability:product:add')"
          >
            <el-icon><Plus /></el-icon>
            新增产品
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="产品名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入产品名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="产品编码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入产品编码"
            clearable
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="产品分类">
          <el-select
            v-model="searchForm.categoryId"
            placeholder="请选择分类"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产地">
          <el-input
            v-model="searchForm.origin"
            placeholder="请输入产地"
            clearable
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
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

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="产品名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="code" label="产品编码" width="120" />
        <el-table-column prop="categoryName" label="产品分类" width="100" align="center" />
        <el-table-column prop="specification" label="规格" width="120" show-overflow-tooltip />
        <el-table-column prop="origin" label="产地" width="120" show-overflow-tooltip />
        <el-table-column prop="shelfLife" label="保质期 (天)" width="100" align="center" />
        <el-table-column prop="storageTemp" label="储存温度" width="100" align="center" />
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
              v-if="userStore.hasPermission('supply:product:edit') || userStore.hasPermission('traceability:product:edit')"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除该产品吗？"
              @confirm="handleDelete(row)"
              v-if="userStore.hasPermission('supply:product:delete') || userStore.hasPermission('traceability:product:delete')"
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
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 产品表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品分类" prop="categoryId">
          <el-select
            v-model="formData.categoryId"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="规格型号" prop="specification">
          <el-input v-model="formData.specification" placeholder="请输入规格型号" />
        </el-form-item>
        <el-form-item label="产地" prop="origin">
          <el-input v-model="formData.origin" placeholder="请输入产地" />
        </el-form-item>
        <el-form-item label="保质期 (天)" prop="shelfLife">
          <el-input-number
            v-model="formData.shelfLife"
            :min="1"
            :max="3650"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="储存温度" prop="storageTemp">
          <el-input v-model="formData.storageTemp" placeholder="如：0-4℃" />
        </el-form-item>
        <el-form-item label="产品描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入产品描述"
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  type Product,
  type ProductCreateParams,
  type ProductUpdateParams
} from '@/api/traceability'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增产品')
const formRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  categoryId: undefined as number | undefined,
  origin: ''
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref<Product[]>([])

// 分类选项
const categoryOptions = ref<Array<{ id: number; name: string }>>([])

// 表单数据
const formData = reactive<ProductCreateParams & { id?: number }>({
  id: undefined,
  categoryId: undefined,
  name: '',
  code: '',
  specification: '',
  origin: '',
  shelfLife: 30,
  storageTemp: '',
  description: '',
  imageUrl: '',
  enabled: true
})

// 表单验证规则
const formRules: FormRules = {
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入产品编码', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择产品分类', trigger: 'change' }]
}

// 获取分类列表
const fetchCategoryOptions = async () => {
  try {
    const res = await getCategories()
    // 响应拦截器返回的是完整响应对象 { code, message, data }
    categoryOptions.value = res.data || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  }
}

// 获取产品列表
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getProducts({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...searchForm
    })
    // 响应拦截器返回的是完整响应对象 { code, message, data }
    tableData.value = res.data?.records || []
    pagination.total = res.data?.total || 0
  } catch (error: any) {
    console.error('获取产品列表失败:', error)
    ElMessage.error(error.message || '获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.code = ''
  searchForm.categoryId = undefined
  searchForm.origin = ''
  handleSearch()
}

// 新增
const handleCreate = () => {
  dialogTitle.value = '新增产品'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Product) => {
  dialogTitle.value = '编辑产品'
  Object.assign(formData, {
    id: row.id,
    categoryId: row.categoryId,
    name: row.name,
    code: row.code,
    specification: row.specification,
    origin: row.origin,
    shelfLife: row.shelfLife,
    storageTemp: row.storageTemp,
    description: row.description,
    imageUrl: row.imageUrl,
    enabled: row.enabled
  })
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: Product) => {
  try {
    await deleteProduct(row.id)
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
        if (formData.id) {
          const { id, ...updateData } = formData
          await updateProduct(formData.id, updateData as ProductUpdateParams)
          ElMessage.success('更新成功')
        } else {
          // 新增时不传递 code，由后端生成
          const { id, code, ...createData } = formData
          await createProduct(createData as any)
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
    categoryId: undefined,
    name: '',
    code: '',
    specification: '',
    origin: '',
    shelfLife: 30,
    storageTemp: '',
    description: '',
    imageUrl: '',
    enabled: true
  })
  formRef.value?.clearValidate()
}

// 关闭对话框
const handleDialogClose = () => {
  resetForm()
}

onMounted(() => {
  fetchCategoryOptions()
  fetchData()
})
</script>

<style scoped>
.product-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
