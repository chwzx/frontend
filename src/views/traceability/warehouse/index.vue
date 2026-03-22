<template>
  <div class="warehouse-management">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="入库登记" name="in"></el-tab-pane>
      <el-tab-pane label="出库登记" name="out"></el-tab-pane>
      <el-tab-pane label="库存查询" name="inventory"></el-tab-pane>
    </el-tabs>

    <!-- 入库/出库登记 -->
    <el-card v-if="activeTab !== 'inventory'">
      <template #header>
        <div class="card-header">
          <span>{{ activeTab === 'in' ? '入库登记' : '出库登记' }}</span>
          <el-button
            type="primary"
            @click="handleCreate"
            v-permission="activeTab === 'in' ? 'traceability:warehouse:add' : 'traceability:warehouse:add'"
          >
            <el-icon><Plus /></el-icon>
            {{ activeTab === 'in' ? '新增入库' : '新增出库' }}
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="单据编号">
          <el-input
            v-model="searchForm.recordNo"
            placeholder="请输入单据编号"
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
        <el-form-item label="仓库名称">
          <el-input
            v-model="searchForm.warehouseName"
            placeholder="请输入仓库名称"
            clearable
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="操作人员">
          <el-input
            v-model="searchForm.operator"
            placeholder="请输入操作人员"
            clearable
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="operateTimeRange"
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
        <el-table-column prop="recordNo" label="单据编号" width="140" />
        <el-table-column prop="batchNo" label="批次编号" width="140" />
        <el-table-column prop="productName" label="产品名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="recordTypeText" label="操作类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.recordType === 'IN' ? 'success' : 'danger'">
              {{ row.recordTypeText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="warehouseName" label="仓库名称" width="120" />
        <el-table-column prop="quantity" label="操作数量" width="100" align="center" />
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column prop="warehouseTemp" label="仓库温度" width="100" align="center" />
        <el-table-column prop="operateTime" label="操作时间" width="160" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.operateTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人员" width="100" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              size="small"
              link
              type="primary"
              @click="handleEdit(row)"
              v-permission="activeTab === 'in' ? 'traceability:warehouse:edit' : 'traceability:warehouse:edit'"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除该记录吗？"
              @confirm="handleDelete(row)"
              v-permission="activeTab === 'in' ? 'traceability:warehouse:delete' : 'traceability:warehouse:delete'"
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

    <!-- 库存查询 -->
    <el-card v-else>
      <template #header>
        <div class="card-header">
          <span>库存查询</span>
          <el-button type="primary" @click="handleRefreshInventory">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="inventorySearchForm" class="search-form">
        <el-form-item label="产品名称">
          <el-input
            v-model="inventorySearchForm.productName"
            placeholder="请输入产品名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleInventorySearch"
          />
        </el-form-item>
        <el-form-item label="批次编号">
          <el-input
            v-model="inventorySearchForm.batchNo"
            placeholder="请输入批次编号"
            clearable
            style="width: 150px"
            @keyup.enter="handleInventorySearch"
          />
        </el-form-item>
        <el-form-item label="仓库名称">
          <el-input
            v-model="inventorySearchForm.warehouseName"
            placeholder="请输入仓库名称"
            clearable
            style="width: 150px"
            @keyup.enter="handleInventorySearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleInventorySearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 库存表格 -->
      <el-table
        v-loading="inventoryLoading"
        :data="inventoryData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="productName" label="产品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="batchNo" label="批次编号" width="140" />
        <el-table-column prop="warehouseName" label="仓库名称" width="120" />
        <el-table-column prop="quantity" label="库存数量" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.quantity < 100 ? 'danger' : 'success'">
              {{ row.quantity }} {{ row.unit }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="warehouseTemp" label="当前温度" width="100" align="center" />
        <el-table-column prop="inTime" label="入库时间" width="160" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.inTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdateTime" label="最后更新" width="160" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.lastUpdateTime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 入库/出库表单对话框 -->
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
            <el-form-item label="仓库名称" prop="warehouseName">
              <el-input v-model="formData.warehouseName" placeholder="请输入仓库名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作数量" prop="quantity">
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
                <el-option label="千克" value="kg" />
                <el-option label="吨" value="t" />
                <el-option label="件" value="piece" />
                <el-option label="箱" value="box" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="仓库温度" prop="warehouseTemp">
              <el-input v-model="formData.warehouseTemp" placeholder="如：0-4℃" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="操作时间" prop="operateTime">
          <el-date-picker
            v-model="formData.operateTime"
            type="datetime"
            placeholder="选择时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="操作人员" prop="operator">
          <el-input v-model="formData.operator" placeholder="请输入操作人员" />
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
  getWarehouseRecords,
  getInventoryList,
  createWarehouseRecord,
  updateWarehouseRecord,
  deleteWarehouseRecord,
  getBatches
} from '@/api/traceability'

const activeTab = ref('in')
const loading = ref(false)
const inventoryLoading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增入库')
const formRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  recordNo: '',
  batchNo: '',
  warehouseName: '',
  operator: ''
})

const operateTimeRange = ref<[string, string] | null>(null)

// 库存搜索表单
const inventorySearchForm = reactive({
  productName: '',
  batchNo: '',
  warehouseName: ''
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref<any[]>([])
const inventoryData = ref<any[]>([])

// 批次选项
const batchOptions = ref<Array<{ id: number; batchNo: string; productName: string; unit: string }>>([])

// 表单数据
const formData = reactive<any>({
  batchId: undefined,
  warehouseName: '',
  quantity: 0,
  unit: 'kg',
  warehouseTemp: '',
  operateTime: '',
  operator: '',
  remark: ''
})

// 表单验证规则
const formRules: FormRules = {
  batchId: [{ required: true, message: '请选择批次', trigger: 'change' }],
  warehouseName: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入操作数量', trigger: 'blur' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
  operateTime: [{ required: true, message: '请选择操作时间', trigger: 'change' }],
  operator: [{ required: true, message: '请输入操作人员', trigger: 'blur' }]
}

// 监听 Tab 切换
const handleTabChange = () => {
  pagination.pageNum = 1
  tableData.value = []
  fetchData()
}

// 获取批次选项
const fetchBatchOptions = async () => {
  try {
    const res = await getBatches({
      pageNum: 1,
      pageSize: 1000,
      status: 'IN_STOCK'
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

// 获取仓储记录列表
const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      recordType: activeTab.value === 'in' ? 'IN' : 'OUT'
    }

    if (searchForm.recordNo) {
      params.recordNo = searchForm.recordNo
    }
    if (searchForm.batchNo) {
      params.batchNo = searchForm.batchNo
    }
    if (searchForm.warehouseName) {
      params.warehouseName = searchForm.warehouseName
    }
    if (searchForm.operator) {
      params.operator = searchForm.operator
    }
    if (operateTimeRange.value && operateTimeRange.value.length === 2) {
      params.operateTimeStart = operateTimeRange.value[0]
      params.operateTimeEnd = operateTimeRange.value[1] + ' 23:59:59'
    }

    const res = await getWarehouseRecords(params)
    if (res?.data?.records) {
      tableData.value = res.data.records
      pagination.total = res.data?.total || 0
    }
  } catch (error) {
    console.error('获取仓储记录列表失败:', error)
    ElMessage.error('获取仓储记录列表失败')
  } finally {
    loading.value = false
  }
}

// 获取库存列表
const fetchInventoryData = async () => {
  inventoryLoading.value = true
  try {
    const res = await getInventoryList()
    if (res?.data && Array.isArray(res.data)) {
      inventoryData.value = res.data
    }
  } catch (error) {
    console.error('获取库存列表失败:', error)
    ElMessage.error('获取库存列表失败')
  } finally {
    inventoryLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.recordNo = ''
  searchForm.batchNo = ''
  searchForm.warehouseName = ''
  searchForm.operator = ''
  operateTimeRange.value = null
  handleSearch()
}

// 库存搜索
const handleInventorySearch = () => {
  fetchInventoryData()
}

// 刷新库存
const handleRefreshInventory = () => {
  fetchInventoryData()
}

// 新增
const handleCreate = () => {
  dialogTitle.value = activeTab.value === 'in' ? '新增入库' : '新增出库'
  resetForm()
  // 设置默认操作时间为当前时间
  formData.operateTime = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-')
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = activeTab.value === 'in' ? '编辑入库' : '编辑出库'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该记录吗？删除后库存将自动重新计算', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteWarehouseRecord(row.id)
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
          recordNo: formData.recordNo || generateRecordNo(),
          recordType: activeTab.value === 'in' ? 'IN' : 'OUT',
          warehouseName: formData.warehouseName,
          quantity: formData.quantity,
          unit: formData.unit,
          warehouseTemp: formData.warehouseTemp,
          operateTime: formData.operateTime,
          operator: formData.operator,
          remark: formData.remark
        }

        if (formData.id) {
          // 更新
          await updateWarehouseRecord(formData.id, data)
          ElMessage.success('更新成功')
        } else {
          // 创建
          await createWarehouseRecord(data)
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

// 生成单据编号
const generateRecordNo = () => {
  const now = new Date()
  const dateStr = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14)
  const type = activeTab.value === 'in' ? 'IN' : 'OUT'
  return `${type}${dateStr}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
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
    warehouseName: '',
    quantity: 0,
    unit: 'kg',
    warehouseTemp: '',
    operateTime: '',
    operator: '',
    remark: ''
  })
  formRef.value?.clearValidate()
}

// 关闭对话框
const handleDialogClose = () => {
  resetForm()
}

// 格式化日期时间
const formatDateTime = (date: string) => {
  if (!date) return '-'
  return date.replace('T', ' ').slice(0, 19)
}

watch(activeTab, () => {
  fetchInventoryData()
})

onMounted(() => {
  fetchBatchOptions()
  fetchData()
  fetchInventoryData()
})
</script>

<style scoped>
.warehouse-management {
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
