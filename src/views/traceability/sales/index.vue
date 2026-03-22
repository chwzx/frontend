<template>
  <div class="sales-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>销售管理</span>
          <el-button
            type="primary"
            @click="handleCreate"
            v-permission="'traceability:sales:add'"
          >
            <el-icon><Plus /></el-icon>
            新增销售
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单编号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单编号"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="批次编号">
          <el-input
            v-model="searchForm.batchNo"
            placeholder="请输入批次编号"
            clearable
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input
            v-model="searchForm.customerName"
            placeholder="请输入客户名称"
            clearable
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="客户类型">
          <el-select
            v-model="searchForm.customerType"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option label="批发商" value="WHOLESALE" />
            <el-option label="零售商" value="RETAIL" />
            <el-option label="消费者" value="CONSUMER" />
          </el-select>
        </el-form-item>
        <el-form-item label="销售人员">
          <el-input
            v-model="searchForm.salesperson"
            placeholder="请输入销售人员"
            clearable
            style="width: 120px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="销售日期">
          <el-date-picker
            v-model="saleDateRange"
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
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="orderNo" label="订单编号" width="140" />
        <el-table-column prop="batchNo" label="批次编号" width="140" />
        <el-table-column prop="productName" label="产品名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="customerName" label="客户名称" width="150" show-overflow-tooltip />
        <el-table-column prop="customerType" label="客户类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getCustomerTypeTag(row.customerType)">
              {{ row.customerTypeText || getCustomerTypeText(row.customerType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="销售数量" width="100" align="center" />
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column prop="unitPrice" label="单价" width="100" align="center">
          <template #default="{ row }">
            ¥{{ row.unitPrice?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="销售总额" width="120" align="center">
          <template #default="{ row }">
            <span class="amount-highlight">¥{{ row.totalAmount?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="saleDate" label="销售日期" width="110" align="center">
          <template #default="{ row }">
            {{ formatDate(row.saleDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="salesperson" label="销售人员" width="100" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              size="small"
              link
              type="primary"
              @click="handleEdit(row)"
              v-permission="'traceability:sales:edit'"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除该销售记录吗？"
              @confirm="handleDelete(row)"
              v-permission="'traceability:sales:delete'"
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

    <!-- 销售表单对话框 -->
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
        <el-form-item label="关联批次" prop="batchId">
          <el-select
            v-model="formData.batchId"
            placeholder="请选择批次"
            style="width: 100%"
            filterable
            @change="handleBatchChange"
          >
            <el-option
              v-for="item in batchOptions"
              :key="item.id"
              :label="`${item.batchNo} - ${item.productName}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="formData.customerName" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户类型" prop="customerType">
              <el-select v-model="formData.customerType" placeholder="请选择" style="width: 100%">
                <el-option label="批发商" value="WHOLESALE" />
                <el-option label="零售商" value="RETAIL" />
                <el-option label="消费者" value="CONSUMER" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户联系方式" prop="customerContact">
              <el-input v-model="formData.customerContact" placeholder="请输入联系方式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单编号" prop="orderNo">
              <el-input v-model="formData.orderNo" placeholder="自动生成或输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="销售数量" prop="quantity">
              <el-input-number
                v-model="formData.quantity"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-select v-model="formData.unit" placeholder="请选择单位" style="width: 100%">
                <el-option label="千克" value="kg" />
                <el-option label="吨" value="t" />
                <el-option label="件" value="piece" />
                <el-option label="箱" value="box" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="销售单价" prop="unitPrice">
              <el-input-number
                v-model="formData.unitPrice"
                :min="0"
                :precision="2"
                :step="0.01"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="销售总额" prop="totalAmount">
              <el-input
                v-model="formData.totalAmount"
                placeholder="自动计算"
                disabled
              >
                <template #append>元</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="销售日期" prop="saleDate">
          <el-date-picker
            v-model="formData.saleDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="销售人员" prop="salesperson">
          <el-input v-model="formData.salesperson" placeholder="请输入销售人员" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getSalesRecords,
  createSalesRecord,
  updateSalesRecord,
  deleteSalesRecord,
  getBatches
} from '@/api/traceability'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增销售')
const formRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  batchNo: '',
  customerName: '',
  customerType: '',
  salesperson: ''
})

const saleDateRange = ref<[string, string] | null>(null)

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref<any[]>([])

// 批次选项
const batchOptions = ref<Array<{ id: number; batchNo: string; productName: string; unit: string }>>([])

// 表单数据
const formData = reactive<any>({
  batchId: undefined,
  orderNo: '',
  customerName: '',
  customerType: '',
  customerContact: '',
  quantity: 0,
  unit: 'kg',
  unitPrice: 0,
  totalAmount: 0,
  saleDate: '',
  salesperson: '',
  remark: ''
})

// 表单验证规则
const formRules: FormRules = {
  batchId: [{ required: true, message: '请选择批次', trigger: 'change' }],
  customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  customerType: [{ required: true, message: '请选择客户类型', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入销售数量', trigger: 'blur' }],
  unitPrice: [{ required: true, message: '请输入销售单价', trigger: 'blur' }],
  saleDate: [{ required: true, message: '请选择销售日期', trigger: 'change' }],
  salesperson: [{ required: true, message: '请输入销售人员', trigger: 'blur' }]
}

// 计算销售总额
watch(() => [formData.quantity, formData.unitPrice], () => {
  formData.totalAmount = formData.quantity * formData.unitPrice
}, { deep: true })

// 获取批次选项
const fetchBatchOptions = async () => {
  try {
    const res = await getBatches({
      pageNum: 1,
      pageSize: 1000,
      status: 'IN_WAREHOUSE'
    })
    if (res?.data?.records) {
      batchOptions.value = res.data.records.map((item: any) => ({
        id: item.id,
        batchNo: item.batchNo,
        productName: item.productName,
        unit: item.unit
      }))
    }
  } catch (error) {
    console.error('获取批次列表失败:', error)
  }
}

// 获取销售记录列表
const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }

    if (searchForm.orderNo) {
      params.orderNo = searchForm.orderNo
    }
    if (searchForm.batchNo) {
      params.batchNo = searchForm.batchNo
    }
    if (searchForm.customerName) {
      params.customerName = searchForm.customerName
    }
    if (searchForm.customerType) {
      params.customerType = searchForm.customerType
    }
    if (searchForm.salesperson) {
      params.salesperson = searchForm.salesperson
    }
    if (saleDateRange.value && saleDateRange.value.length === 2) {
      params.saleDateStart = saleDateRange.value[0]
      params.saleDateEnd = saleDateRange.value[1]
    }

    const res = await getSalesRecords(params)
    if (res?.data?.records) {
      tableData.value = res.data.records
      pagination.total = res.data?.total || 0
    }
  } catch (error) {
    console.error('获取销售记录列表失败:', error)
    ElMessage.error('获取销售记录列表失败')
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
  searchForm.orderNo = ''
  searchForm.batchNo = ''
  searchForm.customerName = ''
  searchForm.customerType = ''
  searchForm.salesperson = ''
  saleDateRange.value = null
  handleSearch()
}

// 新增
const handleCreate = () => {
  dialogTitle.value = '新增销售'
  resetForm()
  // 设置默认销售日期为今天
  formData.saleDate = new Date().toISOString().slice(0, 10)
  // 生成订单编号
  formData.orderNo = generateOrderNo()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑销售'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该销售记录吗？删除后批次状态将重新计算', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteSalesRecord(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
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
          batchId: formData.batchId,
          orderNo: formData.orderNo || generateOrderNo(),
          customerName: formData.customerName,
          customerType: formData.customerType,
          customerContact: formData.customerContact,
          quantity: formData.quantity,
          unit: formData.unit,
          unitPrice: formData.unitPrice,
          saleDate: formData.saleDate,
          salesperson: formData.salesperson,
          remark: formData.remark
        }

        if (formData.id) {
          // 更新
          await updateSalesRecord(formData.id, data)
          ElMessage.success('更新成功')
        } else {
          // 创建
          await createSalesRecord(data)
          ElMessage.success('操作成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error: any) {
        console.error('提交失败:', error)
        ElMessage.error(error.response?.data?.message || '操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 生成订单编号
const generateOrderNo = () => {
  const now = new Date()
  const dateStr = now.toISOString().replace(/[-:T.]/g, '').slice(0, 8)
  return `SO-${dateStr}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
}

// 批次变更时自动填充单位
const handleBatchChange = (batchId: number) => {
  const batch = batchOptions.value.find(item => item.id === batchId)
  if (batch) {
    formData.unit = batch.unit
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    batchId: undefined,
    orderNo: '',
    customerName: '',
    customerType: '',
    customerContact: '',
    quantity: 0,
    unit: 'kg',
    unitPrice: 0,
    totalAmount: 0,
    saleDate: '',
    salesperson: '',
    remark: ''
  })
  formRef.value?.clearValidate()
}

// 关闭对话框
const handleDialogClose = () => {
  resetForm()
}

// 格式化日期
const formatDate = (date: string) => {
  return date || '-'
}

// 获取客户类型文本
const getCustomerTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    WHOLESALE: '批发商',
    RETAIL: '零售商',
    CONSUMER: '消费者'
  }
  return typeMap[type] || type
}

// 获取客户类型标签
const getCustomerTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    WHOLESALE: 'primary',
    RETAIL: 'success',
    CONSUMER: 'info'
  }
  return tagMap[type] || ''
}

onMounted(() => {
  fetchBatchOptions()
  fetchData()
})
</script>

<style scoped>
.sales-management {
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

.amount-highlight {
  color: #f56c6c;
  font-weight: bold;
  font-size: 14px;
}
</style>
