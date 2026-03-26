<template>
  <div class="transport-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>运输记录管理</span>
          <el-button
            type="primary"
            @click="handleCreate"
            v-permission="'traceability:transport:add'"
          >
            <el-icon><Plus /></el-icon>
            新增运输记录
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="运输单号">
          <el-input
            v-model="searchForm.transportNo"
            placeholder="请输入运输单号"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="批次编号">
          <el-input
            v-model="searchForm.batchNo"
            placeholder="请输入批次编号"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="车牌号">
          <el-input
            v-model="searchForm.vehicleNo"
            placeholder="请输入车牌号"
            clearable
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="司机姓名">
          <el-input
            v-model="searchForm.driverName"
            placeholder="请输入司机姓名"
            clearable
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="运输状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            style="width: 150px"
          >
            <el-option label="待运输" value="PENDING" />
            <el-option label="运输中" value="IN_TRANSIT" />
            <el-option label="已到达" value="ARRIVED" />
            <el-option label="异常" value="EXCEPTION" />
          </el-select>
        </el-form-item>
        <el-form-item label="预计出发时间">
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
        <el-table-column prop="transportNo" label="运输单号" width="150" />
        <el-table-column prop="batchNo" label="批次编号" width="140" />
        <el-table-column prop="vehicleNo" label="车牌号" width="120" />
        <el-table-column prop="driverName" label="司机姓名" width="100" />
        <el-table-column prop="driverPhone" label="司机电话" width="130" />
        <el-table-column prop="departurePlace" label="出发地" width="150" show-overflow-tooltip />
        <el-table-column prop="destination" label="目的地" width="150" show-overflow-tooltip />
        <el-table-column prop="plannedDepartureTime" label="预计出发时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.plannedDepartureTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="actualDepartureTime" label="实际出发时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.actualDepartureTime) }}
          </template>
        </el-table-column>
        <el-table-column label="运输状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
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
              type="success"
              link
              size="small"
              @click="handleStartTransport(row)"
              v-if="row.status === 'PENDING'"
              v-permission="'traceability:transport:edit'"
            >
              开始运输
            </el-button>
            <el-button
              type="warning"
              link
              size="small"
              @click="handleAddTemperature(row)"
              v-if="row.status === 'IN_TRANSIT'"
              v-permission="'traceability:transport:add'"
            >
              记录温度
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click="handleEdit(row)"
              v-permission="'traceability:transport:edit'"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
              v-permission="'traceability:transport:delete'"
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
      width="900px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="选择批次" prop="batchId">
              <el-select
                v-model="formData.batchId"
                placeholder="请选择批次"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="item in batchOptions"
                  :key="item.id"
                  :label="item.batchNo + ' - ' + item.productName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运输单号" prop="transportNo">
              <el-input v-model="formData.transportNo" placeholder="请输入运输单号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车牌号" prop="vehicleNo">
              <el-input v-model="formData.vehicleNo" placeholder="请输入车牌号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="司机姓名" prop="driverName">
              <el-input v-model="formData.driverName" placeholder="请输入司机姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="司机电话" prop="driverPhone">
              <el-input v-model="formData.driverPhone" placeholder="请输入司机电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运输状态">
              <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="待运输" value="PENDING" />
                <el-option label="运输中" value="IN_TRANSIT" />
                <el-option label="已到达" value="ARRIVED" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出发地" prop="departurePlace">
              <el-input v-model="formData.departurePlace" placeholder="请输入出发地" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目的地" prop="destination">
              <el-input v-model="formData.destination" placeholder="请输入目的地" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预计出发时间">
              <el-date-picker
                v-model="formData.plannedDepartureTime"
                type="datetime"
                placeholder="选择日期时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计到达时间">
              <el-date-picker
                v-model="formData.plannedArrivalTime"
                type="datetime"
                placeholder="选择日期时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
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
    <el-dialog v-model="detailDialogVisible" title="运输记录详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="运输单号">{{ detailData.transportNo }}</el-descriptions-item>
        <el-descriptions-item label="批次编号">{{ detailData.batchNo }}</el-descriptions-item>
        <el-descriptions-item label="车牌号">{{ detailData.vehicleNo }}</el-descriptions-item>
        <el-descriptions-item label="司机姓名">{{ detailData.driverName }}</el-descriptions-item>
        <el-descriptions-item label="司机电话">{{ detailData.driverPhone }}</el-descriptions-item>
        <el-descriptions-item label="出发地">{{ detailData.departurePlace }}</el-descriptions-item>
        <el-descriptions-item label="目的地">{{ detailData.destination }}</el-descriptions-item>
        <el-descriptions-item label="运输状态">
          <el-tag :type="getStatusType(detailData.status)">
            {{ detailData.statusText }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="预计出发时间">{{ formatDateTime(detailData.plannedDepartureTime) }}</el-descriptions-item>
        <el-descriptions-item label="预计到达时间">{{ formatDateTime(detailData.plannedArrivalTime) }}</el-descriptions-item>
        <el-descriptions-item label="实际出发时间">{{ formatDateTime(detailData.actualDepartureTime) }}</el-descriptions-item>
        <el-descriptions-item label="实际到达时间">{{ formatDateTime(detailData.actualArrivalTime) }}</el-descriptions-item>
        <el-descriptions-item label="异常描述" v-if="detailData.exceptionDesc" :span="2">{{ detailData.exceptionDesc }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 温度记录 -->
      <div style="margin-top: 20px;">
        <h4>温度记录</h4>
        <el-table :data="temperatureRecords" border stripe>
          <el-table-column prop="recordTime" label="记录时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.recordTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="temperature" label="温度 (℃)" width="120">
            <template #default="{ row }">
              <el-tag :type="getTemperatureType(row.temperature)">
                {{ row.temperature }}℃
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="location" label="记录地点" width="150" />
          <el-table-column prop="deviceId" label="设备 ID" width="120" />
          <el-table-column prop="remark" label="备注" />
        </el-table>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 温度记录对话框 -->
    <el-dialog v-model="temperatureDialogVisible" title="记录温度" width="500px">
      <el-form ref="temperatureFormRef" :model="temperatureFormData" :rules="temperatureFormRules" label-width="100px">
        <el-form-item label="记录时间" prop="recordTime">
          <el-date-picker
            v-model="temperatureFormData.recordTime"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="温度值 (℃)" prop="temperature">
          <el-input-number
            v-model="temperatureFormData.temperature"
            :min="-30"
            :max="50"
            :precision="1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="记录地点">
          <el-input v-model="temperatureFormData.location" placeholder="请输入记录地点" />
        </el-form-item>
        <el-form-item label="设备 ID">
          <el-input v-model="temperatureFormData.deviceId" placeholder="请输入设备 ID" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temperatureFormData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="temperatureDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitTemperature" :loading="temperatureSubmitLoading">
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
  getTransportRecords,
  createTransportRecord,
  updateTransportRecord,
  deleteTransportRecord,
  updateTransportStatus,
  addTemperatureRecord,
  getBatches,
  type TransportRecord,
  type TransportRecordCreateParams,
  type TransportRecordUpdateParams,
  type TemperatureRecordDTO
} from '@/api/traceability'

const loading = ref(false)
const submitLoading = ref(false)
const temperatureSubmitLoading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const temperatureDialogVisible = ref(false)
const dialogTitle = ref('新增运输记录')
const formRef = ref<FormInstance>()
const temperatureFormRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  transportNo: '',
  batchNo: '',
  vehicleNo: '',
  driverName: '',
  status: undefined as string | undefined
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
const tableData = ref<TransportRecord[]>([])

// 批次选项
const batchOptions = ref<Array<{ id: number; batchNo: string; productName: string }>>([])

// 表单数据
const formData = reactive<TransportRecordCreateParams & { id?: number }>({
  id: undefined,
  batchId: undefined,
  transportNo: '',
  vehicleNo: '',
  driverName: '',
  driverPhone: '',
  departurePlace: '',
  destination: '',
  plannedDepartureTime: '',
  plannedArrivalTime: '',
  status: 'PENDING',
  remark: ''
})

// 温度表单数据
const temperatureFormData = reactive<TemperatureRecordDTO>({
  recordTime: '',
  temperature: 0,
  location: '',
  deviceId: '',
  remark: ''
})

// 详情数据
const detailData = ref<TransportRecord>({
  id: 0,
  batchId: 0,
  transportNo: '',
  vehicleNo: '',
  driverName: '',
  driverPhone: '',
  departurePlace: '',
  destination: '',
  status: '',
  statusText: '',
  createTime: '',
  updateTime: ''
})

// 温度记录列表
const temperatureRecords = ref<any[]>([])

// 表单验证规则
const formRules: FormRules = {
  batchId: [{ required: true, message: '请选择批次', trigger: 'change' }],
  transportNo: [{ required: true, message: '请输入运输单号', trigger: 'blur' }],
  vehicleNo: [{ required: true, message: '请输入车牌号', trigger: 'blur' }],
  driverName: [{ required: true, message: '请输入司机姓名', trigger: 'blur' }],
  driverPhone: [{ required: true, message: '请输入司机电话', trigger: 'blur' }],
  departurePlace: [{ required: true, message: '请输入出发地', trigger: 'blur' }],
  destination: [{ required: true, message: '请输入目的地', trigger: 'blur' }]
}

// 温度表单验证规则
const temperatureFormRules: FormRules = {
  recordTime: [{ required: true, message: '请选择记录时间', trigger: 'change' }],
  temperature: [{ required: true, message: '请输入温度值', trigger: 'blur' }]
}

// 获取批次列表
const fetchBatchOptions = async () => {
  try {
    const res = await getBatches({ pageNum: 1, pageSize: 1000 })
    batchOptions.value = res.data?.records || []
  } catch (error) {
    console.error('获取批次列表失败:', error)
  }
}

// 获取运输记录列表
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
      params.plannedDepartureTimeStart = dateRange.value[0]
      params.plannedDepartureTimeEnd = dateRange.value[1]
    }

    const res = await getTransportRecords(params)
    tableData.value = res.data?.records || []
    pagination.total = res.data?.total || 0
  } catch (error: any) {
    console.error('获取运输记录列表失败:', error)
    ElMessage.error(error.message || '获取运输记录列表失败')
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
  searchForm.transportNo = ''
  searchForm.batchNo = ''
  searchForm.vehicleNo = ''
  searchForm.driverName = ''
  searchForm.status = undefined
  dateRange.value = null
  handleSearch()
}

// 新增
const handleCreate = async () => {
  dialogTitle.value = '新增运输记录'
  resetForm()
  await fetchBatchOptions() // 只在打开对话框时加载批次列表
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row: TransportRecord) => {
  dialogTitle.value = '编辑运输记录'
  Object.assign(formData, {
    id: row.id,
    batchId: row.batchId,
    transportNo: row.transportNo,
    vehicleNo: row.vehicleNo,
    driverName: row.driverName,
    driverPhone: row.driverPhone,
    departurePlace: row.departurePlace,
    destination: row.destination,
    plannedDepartureTime: row.plannedDepartureTime,
    plannedArrivalTime: row.plannedArrivalTime,
    status: row.status,
    remark: row.remark
  })
  await fetchBatchOptions() // 只在打开对话框时加载批次列表
  dialogVisible.value = true
}

// 查看详情
const handleView = async (row: TransportRecord) => {
  Object.assign(detailData.value, row)
  // 温度记录已经在 row.temperatureRecords 中
  temperatureRecords.value = row.temperatureRecords || []
  detailDialogVisible.value = true
}

// 开始运输
const handleStartTransport = async (row: TransportRecord) => {
  try {
    await ElMessageBox.confirm('确定要开始运输吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await updateTransportStatus(row.id, 'IN_TRANSIT')
    ElMessage.success('已开始运输')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 添加温度记录
const handleAddTemperature = (row: TransportRecord) => {
  temperatureFormData.recordTime = ''
  temperatureFormData.temperature = 0
  temperatureFormData.location = ''
  temperatureFormData.deviceId = ''
  temperatureFormData.remark = ''
  currentTransportId.value = row.id
  temperatureDialogVisible.value = true
}

// 删除
const handleDelete = async (row: TransportRecord) => {
  try {
    await ElMessageBox.confirm('确定要删除该运输记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteTransportRecord(row.id)
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
        await updateTransportRecord(formData.id, formData as TransportRecordUpdateParams)
        ElMessage.success('更新成功')
      } else {
        await createTransportRecord(formData as TransportRecordCreateParams)
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

// 提交温度记录
const currentTransportId = ref<number>(0)

const handleSubmitTemperature = async () => {
  if (!temperatureFormRef.value) return
  
  await temperatureFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    temperatureSubmitLoading.value = true
    try {
      await addTemperatureRecord(currentTransportId.value, temperatureFormData)
      ElMessage.success('温度记录成功')
      temperatureDialogVisible.value = false
      fetchData()
    } catch (error: any) {
      ElMessage.error(error.message || '记录失败')
    } finally {
      temperatureSubmitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  formData.id = undefined
  formData.batchId = undefined
  formData.transportNo = ''
  formData.vehicleNo = ''
  formData.driverName = ''
  formData.driverPhone = ''
  formData.departurePlace = ''
  formData.destination = ''
  formData.plannedDepartureTime = ''
  formData.plannedArrivalTime = ''
  formData.status = 'PENDING'
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

// 格式化日期时间
const formatDateTime = (date: string | undefined) => {
  if (!date) return '-'
  return date.replace('T', ' ')
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'info'
    case 'IN_TRANSIT':
      return 'warning'
    case 'ARRIVED':
      return 'success'
    case 'EXCEPTION':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取温度标签类型
const getTemperatureType = (temp: number) => {
  if (temp < -20 || temp > 10) {
    return 'danger'
  } else if (temp < -10 || temp > 5) {
    return 'warning'
  }
  return 'success'
}

onMounted(() => {
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
