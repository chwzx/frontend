<template>
  <div class="supplier-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>供应商管理</span>
          <div class="header-actions">
            <el-button
              v-if="selectedSuppliers.length > 0"
              type="danger"
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
            <el-button
              v-if="selectedSuppliers.length > 0"
              type="warning"
              @click="handleBatchToggleStatus"
            >
              <el-icon><Switch /></el-icon>
              {{ allEnabled ? '批量禁用' : '批量启用' }}
            </el-button>
            <el-button type="primary" @click="handleCreate" v-if="userStore.hasPermission('supply:supplier:add')">
              <el-icon><Plus /></el-icon>
              新增供应商
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="searchForm.keyword"
            placeholder="供应商名称/编码/联系人"
            clearable
            style="width: 240px"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px" @change="handleSearch">
            <el-option label="正常" value="ACTIVE" />
            <el-option label="暂停" value="INACTIVE" />
          </el-select>
        </el-form-item>
        <el-form-item label="信用评级">
          <el-select v-model="searchForm.creditRating" placeholder="全部" clearable style="width: 120px" @change="handleSearch">
            <el-option label="优秀" value="A" />
            <el-option label="良好" value="B" />
            <el-option label="一般" value="C" />
            <el-option label="较差" value="D" />
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

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="code" label="供应商编码" width="150" />
        <el-table-column prop="name" label="供应商名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="contactPerson" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column prop="contactEmail" label="联系邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="creditRating" label="信用评级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getCreditRatingTagType(row.creditRating)" effect="plain">
              {{ row.creditRatingText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'" effect="plain">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="启用状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled === 1 ? 'success' : 'danger'" effect="plain">
              {{ row.enabledText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="handleEdit(row)" v-if="userStore.hasPermission('supply:supplier:edit')">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              size="small"
              link
              :type="row.enabled === 1 ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
              v-if="userStore.hasPermission('supply:supplier:edit')"
            >
              <el-icon><Switch /></el-icon>
              {{ row.enabled === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-popconfirm
              title="确定要删除该供应商吗？删除后不可恢复！"
              @confirm="handleDelete(row)"
              v-if="userStore.hasPermission('supply:supplier:delete')"
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
        v-model:current-page="searchForm.pageNum"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSearch"
        @current-change="handleSearch"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 供应商对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商编码" prop="code">
              <el-input v-model="form.code" placeholder="请输入供应商编码" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入供应商名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactPerson">
              <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系邮箱" prop="contactEmail">
              <el-input v-model="form.contactEmail" placeholder="请输入联系邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="信用评级" prop="creditRating">
              <el-select v-model="form.creditRating" placeholder="请选择信用评级" style="width: 100%">
                <el-option label="优秀 (A)" value="A" />
                <el-option label="良好 (B)" value="B" />
                <el-option label="一般 (C)" value="C" />
                <el-option label="较差 (D)" value="D" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="正常" value="ACTIVE" />
                <el-option label="暂停" value="INACTIVE" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用状态" prop="enabled">
              <el-radio-group v-model="form.enabled">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" type="textarea" :rows="2" placeholder="请输入地址" />
        </el-form-item>

        <el-form-item label="营业执照号" prop="businessLicense">
          <el-input v-model="form.businessLicense" placeholder="请输入营业执照号" />
        </el-form-item>

        <el-form-item label="税号" prop="taxNumber">
          <el-input v-model="form.taxNumber" placeholder="请输入税号" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开户银行" prop="bankName">
              <el-input v-model="form.bankName" placeholder="请输入开户银行" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="银行账号" prop="bankAccount">
              <el-input v-model="form.bankAccount" placeholder="请输入银行账号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
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
  Switch
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import {
  getSupplierList,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  batchDeleteSuppliers,
  toggleSupplierStatus,
  batchToggleStatus,
  checkCodeExists,
  type Supplier,
  type SupplierDTO,
  type SupplierQueryParams
} from '@/api/supply'

const userStore = useUserStore()

// 表格数据
const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<Supplier[]>([])
const total = ref(0)
const selectedSuppliers = ref<Supplier[]>([])

// 搜索表单
const searchForm = reactive<SupplierQueryParams>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  creditRating: '',
  enabled: undefined
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增供应商')
const isEdit = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<SupplierDTO>({
  code: '',
  name: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  businessLicense: '',
  taxNumber: '',
  bankName: '',
  bankAccount: '',
  creditRating: 'A',
  status: 'ACTIVE',
  remark: '',
  enabled: 1
})

// 表单验证规则
const rules = computed<FormRules>(() => ({
  code: [
    { required: true, message: '请输入供应商编码', trigger: 'blur' },
    { pattern: /^[A-Z0-9]+$/, message: '编码只能包含大写字母和数字', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入供应商名称', trigger: 'blur' }
  ],
  contactPhone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  contactEmail: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}))

// 计算全选启用状态
const allEnabled = computed(() => {
  return selectedSuppliers.value.length > 0 && selectedSuppliers.value.every(s => s.enabled === 1)
})

// 获取供应商列表
const loadSupplierList = async () => {
  loading.value = true
  try {
    const res = await getSupplierList(searchForm)
    // res 是完整响应对象 { code, message, data }，数据在 data 中
    tableData.value = res.data?.records || []
    total.value = res.data?.total || 0
  } catch (error) {
    ElMessage.error('获取供应商列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  searchForm.pageNum = 1
  loadSupplierList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.creditRating = ''
  searchForm.enabled = undefined
  handleSearch()
}

// 选择变化
const handleSelectionChange = (selection: Supplier[]) => {
  selectedSuppliers.value = selection
}

// 新增
const handleCreate = () => {
  isEdit.value = false
  dialogTitle.value = '新增供应商'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Supplier) => {
  isEdit.value = true
  dialogTitle.value = '编辑供应商'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: Supplier) => {
  try {
    await ElMessageBox.confirm('确定要删除该供应商吗？删除后不可恢复！', '提示', {
      type: 'warning'
    })
    await deleteSupplier(row.id!)
    ElMessage.success('删除成功')
    loadSupplierList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedSuppliers.value.length === 0) {
    ElMessage.warning('请选择要删除的供应商')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedSuppliers.value.length} 个供应商吗？删除后不可恢复！`,
      '提示',
      { type: 'warning' }
    )
    const ids = selectedSuppliers.value.map(s => s.id!)
    await batchDeleteSuppliers(ids)
    ElMessage.success('批量删除成功')
    selectedSuppliers.value = []
    loadSupplierList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 切换状态
const handleToggleStatus = async (row: Supplier) => {
  try {
    const newStatus = row.enabled === 1 ? 0 : 1
    const action = newStatus === 1 ? '启用' : '禁用'
    await ElMessageBox.confirm(`确定要${action}该供应商吗？`, '提示', {
      type: 'warning'
    })
    await toggleSupplierStatus(row.id!, newStatus)
    ElMessage.success(`${action}成功`)
    loadSupplierList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
    }
  }
}

// 批量切换状态
const handleBatchToggleStatus = async () => {
  if (selectedSuppliers.value.length === 0) {
    ElMessage.warning('请选择要操作的供应商')
    return
  }

  const newStatus = allEnabled.value ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'

  try {
    await ElMessageBox.confirm(
      `确定要${action}选中的 ${selectedSuppliers.value.length} 个供应商吗？`,
      '提示',
      { type: 'warning' }
    )
    const ids = selectedSuppliers.value.map(s => s.id!)
    await batchToggleStatus(ids, newStatus)
    ElMessage.success(`${action}成功`)
    selectedSuppliers.value = []
    loadSupplierList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      // 检查编码是否已存在
      if (isEdit.value) {
        const exists = await checkCodeExists(form.code, form.id)
        if (exists && form.code !== (tableData.value.find(s => s.id === form.id)?.code)) {
          ElMessage.error('供应商编码已存在')
          return
        }
      } else {
        const exists = await checkCodeExists(form.code)
        if (exists) {
          ElMessage.error('供应商编码已存在')
          return
        }
      }

      if (isEdit.value) {
        await updateSupplier(form.id!, form)
        ElMessage.success('更新成功')
      } else {
        await createSupplier(form)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadSupplierList()
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    code: '',
    name: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    businessLicense: '',
    taxNumber: '',
    bankName: '',
    bankAccount: '',
    creditRating: 'A',
    status: 'ACTIVE',
    remark: '',
    enabled: 1
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  resetForm()
}

// 获取信用评级标签类型
const getCreditRatingTagType = (rating: string) => {
  const types: Record<string, any> = {
    A: 'success',
    B: '',
    C: 'warning',
    D: 'danger'
  }
  return types[rating] || ''
}

onMounted(() => {
  loadSupplierList()
})
</script>

<style scoped>
.supplier-management {
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
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-pagination) {
  display: flex;
}
</style>
