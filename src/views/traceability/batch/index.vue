<template>
  <div class="batch-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>生产批次管理</span>
          <el-button
            type="primary"
            @click="handleCreate"
            v-permission="'traceability:batch:add'"
          >
            <el-icon><Plus /></el-icon>
            新增批次
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="批次编号">
          <el-input
            v-model="searchForm.batchNo"
            placeholder="请输入批次编号"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input
            v-model="searchForm.productName"
            placeholder="请输入产品名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="批次状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            style="width: 150px"
          >
            <el-option label="生产中" value="PRODUCING" />
            <el-option label="已入库" value="IN_WAREHOUSE" />
            <el-option label="运输中" value="IN_TRANSPORT" />
            <el-option label="已销售" value="SOLD" />
            <el-option label="已归档" value="ARCHIVED" />
          </el-select>
        </el-form-item>
        <el-form-item label="质检结果">
          <el-select
            v-model="searchForm.qualityResult"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option label="合格" value="合格" />
            <el-option label="不合格" value="不合格" />
          </el-select>
        </el-form-item>
        <el-form-item label="生产日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
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
        <el-table-column prop="batchNo" label="批次编号" width="150" />
        <el-table-column prop="productName" label="产品名称" width="150" />
        <el-table-column prop="productCode" label="产品编码" width="120" />
        <el-table-column prop="categoryName" label="产品分类" width="100" />
        <el-table-column prop="productionDate" label="生产日期" width="110">
          <template #default="{ row }">
            {{ formatDate(row.productionDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="producer" label="生产人员" width="100" />
        <el-table-column prop="productionLocation" label="生产地点" width="120" show-overflow-tooltip />
        <el-table-column label="质检结果" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.qualityResult" :type="row.qualityResult === '合格' ? 'success' : 'danger'">
              {{ row.qualityResult }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="批次状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleView(row)"
            >
              详情
            </el-button>
            <el-button
              v-if="!row.qualityResult"
              type="warning"
              link
              size="small"
              @click="handleQualityCheck(row)"
              v-permission="'traceability:batch:edit'"
            >
              质检
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click="handleEdit(row)"
              v-permission="'traceability:batch:edit'"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
              v-permission="'traceability:batch:delete'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="选择产品" prop="productId">
              <el-select
                v-model="formData.productId"
                placeholder="请选择产品"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="item in productOptions"
                  :key="item.id"
                  :label="item.name + ' (' + item.code + ')'"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生产日期" prop="productionDate">
              <el-date-picker
                v-model="formData.productionDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number
                v-model="formData.quantity"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-select v-model="formData.unit" placeholder="请选择单位" style="width: 100%">
                <el-option label="kg" value="kg" />
                <el-option label="吨 (t)" value="t" />
                <el-option label="件 (piece)" value="piece" />
                <el-option label="箱 (box)" value="box" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产人员">
              <el-input v-model="formData.producer" placeholder="请输入生产人员" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="生产地点">
              <el-input v-model="formData.productionLocation" placeholder="请输入生产地点" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="批次状态">
              <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="生产中" value="PRODUCING" />
                <el-option label="已入库" value="IN_WAREHOUSE" />
                <el-option label="运输中" value="IN_TRANSPORT" />
                <el-option label="已销售" value="SOLD" />
                <el-option label="已归档" value="ARCHIVED" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="批次详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="批次编号">{{ detailData.batchNo }}</el-descriptions-item>
        <el-descriptions-item label="产品名称">{{ detailData.productName }}</el-descriptions-item>
        <el-descriptions-item label="产品编码">{{ detailData.productCode }}</el-descriptions-item>
        <el-descriptions-item label="产品分类">{{ detailData.categoryName }}</el-descriptions-item>
        <el-descriptions-item label="生产日期">{{ formatDate(detailData.productionDate) }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ detailData.quantity }} {{ detailData.unit }}</el-descriptions-item>
        <el-descriptions-item label="生产人员">{{ detailData.producer || '-' }}</el-descriptions-item>
        <el-descriptions-item label="生产地点">{{ detailData.productionLocation || '-' }}</el-descriptions-item>
        <el-descriptions-item label="质检结果">
          <el-tag v-if="detailData.qualityResult" :type="detailData.qualityResult === '合格' ? 'success' : 'danger'">
            {{ detailData.qualityResult }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="质检员">{{ detailData.qualityChecker || '-' }}</el-descriptions-item>
        <el-descriptions-item label="质检时间">{{ detailData.qualityTime ? formatDate(detailData.qualityTime, true) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="批次状态">
          <el-tag :type="getStatusType(detailData.status)">
            {{ detailData.statusText }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="质检报告" v-if="detailData.qualityReportUrl">
          <el-link :href="detailData.qualityReportUrl" target="_blank" type="primary">查看报告</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(detailData.createTime, true) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(detailData.updateTime, true) }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 质检对话框 -->
    <el-dialog v-model="qualityDialogVisible" title="批次质检" width="500px">
      <el-form ref="qualityFormRef" :model="qualityFormData" :rules="qualityFormRules" label-width="100px">
        <el-form-item label="质检结果" prop="qualityResult">
          <el-radio-group v-model="qualityFormData.qualityResult">
            <el-radio label="合格">合格</el-radio>
            <el-radio label="不合格">不合格</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="质检员" prop="qualityChecker">
          <el-input v-model="qualityFormData.qualityChecker" placeholder="请输入质检员姓名" />
        </el-form-item>
        <el-form-item label="质检报告 URL">
          <el-input v-model="qualityFormData.qualityReportUrl" placeholder="请输入质检报告 URL（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="qualityDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitQuality" :loading="qualitySubmitLoading">
          提交
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
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  updateBatchQuality,
  getProducts,
  type Batch,
  type BatchCreateParams,
  type BatchUpdateParams
} from '@/api/traceability'

const loading = ref(false)
const submitLoading = ref(false)
const qualitySubmitLoading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const qualityDialogVisible = ref(false)
const dialogTitle = ref('新增批次')
const formRef = ref<FormInstance>()
const qualityFormRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  batchNo: '',
  productName: '',
  status: undefined as string | undefined,
  qualityResult: undefined as string | undefined,
  productId: undefined as number | undefined
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref<Batch[]>([])

// 产品选项
const productOptions = ref<Array<{ id: number; name: string; code: string }>>([])

// 表单数据
const formData = reactive<BatchCreateParams & { id?: number }>({
  id: undefined,
  productId: undefined,
  batchNo: '',
  productionDate: '',
  quantity: 0,
  unit: 'box',
  producer: '',
  productionLocation: '',
  qualityResult: '',
  qualityChecker: '',
  qualityReportUrl: '',
  status: 'PRODUCING',
  remark: ''
})

// 质检表单数据
const qualityFormData = reactive({
  qualityResult: '合格',
  qualityChecker: '',
  qualityReportUrl: ''
})

// 详情数据
const detailData = ref<Batch>({
  id: 0,
  productId: 0,
  batchNo: '',
  productionDate: '',
  quantity: 0,
  unit: '',
  producer: '',
  productionLocation: '',
  qualityResult: '',
  qualityChecker: '',
  qualityTime: '',
  qualityReportUrl: '',
  status: '',
  statusText: '',
  remark: '',
  productName: '',
  productCode: '',
  categoryName: '',
  createTime: '',
  updateTime: ''
})

// 表单验证规则
const formRules: FormRules = {
  productId: [{ required: true, message: '请选择产品', trigger: 'change' }],
  productionDate: [{ required: true, message: '请选择生产日期', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }]
}

// 质检表单验证规则
const qualityFormRules: FormRules = {
  qualityResult: [{ required: true, message: '请选择质检结果', trigger: 'change' }],
  qualityChecker: [{ required: true, message: '请输入质检员', trigger: 'blur' }]
}

// 获取产品列表
const fetchProductOptions = async () => {
  try {
    const res = await getProducts({ pageNum: 1, pageSize: 1000, enabled: 1 })
    productOptions.value = res.data?.records || []
  } catch (error) {
    console.error('获取产品列表失败:', error)
  }
}

// 获取批次列表
const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...searchForm
    }

    // 处理日期范围
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      params.productionDateStart = dateRange.value[0]
      params.productionDateEnd = dateRange.value[1]
    }

    const res = await getBatches(params)
    tableData.value = res.data?.records || []
    pagination.total = res.data?.total || 0
  } catch (error: any) {
    console.error('获取批次列表失败:', error)
    ElMessage.error(error.message || '获取批次列表失败')
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
  searchForm.batchNo = ''
  searchForm.productName = ''
  searchForm.status = undefined
  searchForm.qualityResult = undefined
  searchForm.productId = undefined
  dateRange.value = null
  handleSearch()
}

// 新增
const handleCreate = () => {
  dialogTitle.value = '新增批次'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Batch) => {
  dialogTitle.value = '编辑批次'
  Object.assign(formData, {
    id: row.id,
    productId: row.productId,
    batchNo: row.batchNo,
    productionDate: row.productionDate,
    quantity: row.quantity,
    unit: row.unit,
    producer: row.producer,
    productionLocation: row.productionLocation,
    status: row.status,
    remark: row.remark
  })
  dialogVisible.value = true
}

// 查看详情
const handleView = (row: Batch) => {
  Object.assign(detailData.value, row)
  detailDialogVisible.value = true
}

// 质检
const handleQualityCheck = (row: Batch) => {
  qualityFormData.qualityResult = '合格'
  qualityFormData.qualityChecker = row.qualityChecker || ''
  qualityFormData.qualityReportUrl = row.qualityReportUrl || ''
  qualityDialogVisible.value = true
}

// 删除
const handleDelete = async (row: Batch) => {
  try {
    await ElMessageBox.confirm('确定要删除该批次吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteBatch(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
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
      if (formData.id) {
        // 编辑时传递完整数据
        await updateBatch(formData.id, formData as BatchUpdateParams)
        ElMessage.success('更新成功')
      } else {
        // 新增时不传递 batchNo，由后端生成
        const { batchNo, ...createData } = formData
        await createBatch(createData as any)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchData()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 提交质检
const handleSubmitQuality = async () => {
  if (!qualityFormRef.value) return
  
  await qualityFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    qualitySubmitLoading.value = true
    try {
      await updateBatchQuality(
        (detailData.value as any).id,
        qualityFormData.qualityResult,
        qualityFormData.qualityChecker,
        qualityFormData.qualityReportUrl
      )
      ElMessage.success('质检完成')
      qualityDialogVisible.value = false
      fetchData()
    } catch (error: any) {
      ElMessage.error(error.message || '质检失败')
    } finally {
      qualitySubmitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  formData.id = undefined
  formData.productId = undefined
  formData.batchNo = ''
  formData.productionDate = ''
  formData.quantity = 0
  formData.unit = 'box'
  formData.producer = ''
  formData.productionLocation = ''
  formData.status = 'PRODUCING'
  formData.remark = ''
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 关闭对话框
const handleDialogClose = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchData()
}

// 页码改变
const handlePageChange = (val: number) => {
  pagination.pageNum = val
  fetchData()
}

// 格式化日期
const formatDate = (date: string, showTime = false) => {
  if (!date) return '-'
  if (showTime) {
    return date.replace('T', ' ')
  }
  return date.split('T')[0]
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'PRODUCING':
      return 'warning'
    case 'IN_WAREHOUSE':
      return 'success'
    case 'IN_TRANSPORT':
      return 'primary'
    case 'SOLD':
      return 'info'
    case 'ARCHIVED':
      return 'danger'
    default:
      return 'info'
  }
}

onMounted(() => {
  fetchProductOptions()
  fetchData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}
</style>
