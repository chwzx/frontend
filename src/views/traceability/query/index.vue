<template>
  <div class="trace-query">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>溯源查询</span>
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
        <el-form-item label="产品编码">
          <el-input
            v-model="searchForm.productCode"
            placeholder="请输入产品编码"
            clearable
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="订单编号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单编号"
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

      <!-- 溯源信息展示 -->
      <div v-if="traceInfo" class="trace-content">
        <!-- 产品基本信息 -->
        <el-card class="product-info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>产品基本信息</span>
              <el-button
                type="primary"
                size="small"
                @click="handleExportReport"
                v-permission="'traceability:product:export'"
              >
                <el-icon><Download /></el-icon>
                导出报告
              </el-button>
            </div>
          </template>
          <el-descriptions :column="4" border v-if="traceInfo.productInfo">
            <el-descriptions-item label="产品名称">{{ traceInfo.productInfo.productName }}</el-descriptions-item>
            <el-descriptions-item label="产品编码">{{ traceInfo.productInfo.productCode }}</el-descriptions-item>
            <el-descriptions-item label="分类">{{ traceInfo.productInfo.categoryName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="规格">{{ traceInfo.productInfo.specification || '-' }}</el-descriptions-item>
            <el-descriptions-item label="产地">{{ traceInfo.productInfo.origin || '-' }}</el-descriptions-item>
            <el-descriptions-item label="保质期">{{ traceInfo.productInfo.shelfLife ? traceInfo.productInfo.shelfLife + '天' : '-' }}</el-descriptions-item>
            <el-descriptions-item label="储存温度">{{ traceInfo.productInfo.storageTemp || '-' }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="4">{{ traceInfo.productInfo.description || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 生产批次信息 -->
        <el-card class="batch-info-card" shadow="hover" v-if="traceInfo.batchInfo">
          <template #header>
            <span>生产批次信息</span>
          </template>
          <el-descriptions :column="4" border>
            <el-descriptions-item label="批次编号">{{ traceInfo.batchInfo.batchNo }}</el-descriptions-item>
            <el-descriptions-item label="生产日期">{{ formatDate(traceInfo.batchInfo.productionDate) }}</el-descriptions-item>
            <el-descriptions-item label="生产数量">{{ traceInfo.batchInfo.quantity }} {{ traceInfo.batchInfo.unit }}</el-descriptions-item>
            <el-descriptions-item label="生产地点">{{ traceInfo.batchInfo.productionLocation || '-' }}</el-descriptions-item>
            <el-descriptions-item label="生产人员">{{ traceInfo.batchInfo.producer || '-' }}</el-descriptions-item>
            <el-descriptions-item label="质检结果">
              <el-tag :type="traceInfo.batchInfo.qualityResult === '合格' ? 'success' : 'danger'">
                {{ traceInfo.batchInfo.qualityResult || '-' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="质检人员">{{ traceInfo.batchInfo.qualityChecker || '-' }}</el-descriptions-item>
            <el-descriptions-item label="质检时间">{{ formatDateTime(traceInfo.batchInfo.qualityTime) }}</el-descriptions-item>
            <el-descriptions-item label="批次状态">
              <el-tag :type="getBatchStatusType(traceInfo.batchInfo.status)">
                {{ getBatchStatusText(traceInfo.batchInfo.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 时间轴 -->
        <el-card class="timeline-card" shadow="hover">
          <template #header>
            <span>全流程追溯</span>
          </template>
          <el-steps :active="traceInfo.timeline?.length || 0" direction="vertical" v-if="traceInfo.timeline && traceInfo.timeline.length > 0">
            <el-step
              v-for="step in traceInfo.timeline"
              :key="step.stepOrder"
              :title="step.title"
              :description="step.description"
            >
              <template #icon>
                <el-icon :size="20" :color="getIconColor(step.stepType)">
                  <component :is="getStepIcon(step.icon)" />
                </el-icon>
              </template>
              <template #content>
                <div class="step-content">
                  <div class="step-time">{{ step.time }}</div>
                  <div class="step-detail" v-html="step.detail"></div>
                  <div class="step-tags" v-if="step.tags && step.tags.length">
                    <el-tag
                      v-for="tag in step.tags"
                      :key="tag"
                      size="small"
                      :type="getTagType(tag)"
                      style="margin-right: 5px"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
              </template>
            </el-step>
          </el-steps>
          <el-empty v-else description="暂无溯源记录" />
        </el-card>

        <!-- 仓储记录 -->
        <el-card class="warehouse-card" shadow="hover" v-if="traceInfo.warehouseRecords && traceInfo.warehouseRecords.length > 0">
          <template #header>
            <span>仓储记录</span>
          </template>
          <el-table :data="traceInfo.warehouseRecords" border stripe>
            <el-table-column prop="recordNo" label="单据编号" width="150" />
            <el-table-column prop="recordTypeText" label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="row.recordType === 'IN' ? 'success' : 'warning'">
                  {{ row.recordTypeText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="warehouseName" label="仓库名称" width="150" />
            <el-table-column label="数量" width="120">
              <template #default="{ row }">
                {{ row.quantity }} {{ row.unit }}
              </template>
            </el-table-column>
            <el-table-column prop="warehouseTemp" label="温度" width="100" />
            <el-table-column prop="operateTime" label="操作时间" width="180" />
            <el-table-column prop="operator" label="操作人员" width="120" />
            <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          </el-table>
        </el-card>

        <!-- 运输记录 -->
        <el-card class="transport-card" shadow="hover" v-if="traceInfo.transportRecords && traceInfo.transportRecords.length > 0">
          <template #header>
            <span>运输记录</span>
          </template>
          <el-table :data="traceInfo.transportRecords" border stripe>
            <el-table-column prop="transportNo" label="运输单号" width="150" />
            <el-table-column prop="vehicleNo" label="车牌号" width="120" />
            <el-table-column prop="driverName" label="司机" width="100" />
            <el-table-column prop="driverPhone" label="司机电话" width="130" />
            <el-table-column label="运输路线" width="250">
              <template #default="{ row }">
                {{ row.departurePlace }} → {{ row.destination }}
              </template>
            </el-table-column>
            <el-table-column prop="statusText" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getTransportStatusType(row.status)">
                  {{ row.statusText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="actualDepartureTime" label="实际出发" width="180" />
            <el-table-column prop="actualArrivalTime" label="实际到达" width="180" />
            <el-table-column prop="exceptionDesc" label="异常描述" show-overflow-tooltip />
          </el-table>
        </el-card>

        <!-- 销售记录 -->
        <el-card class="sales-card" shadow="hover" v-if="traceInfo.salesRecords && traceInfo.salesRecords.length > 0">
          <template #header>
            <span>销售记录</span>
          </template>
          <el-table :data="traceInfo.salesRecords" border stripe>
            <el-table-column prop="orderNo" label="订单编号" width="150" />
            <el-table-column prop="customerName" label="客户名称" width="180" />
            <el-table-column prop="customerTypeText" label="客户类型" width="100" />
            <el-table-column prop="customerContact" label="联系方式" width="130" />
            <el-table-column label="销售数量" width="120">
              <template #default="{ row }">
                {{ row.quantity }} {{ row.unit }}
              </template>
            </el-table-column>
            <el-table-column label="单价" width="100">
              <template #default="{ row }">
                ¥{{ row.unitPrice }}
              </template>
            </el-table-column>
            <el-table-column label="销售总额" width="120">
              <template #default="{ row }">
                ¥{{ row.totalAmount }}
              </template>
            </el-table-column>
            <el-table-column prop="saleDate" label="销售日期" width="120" />
            <el-table-column prop="salesperson" label="销售人员" width="100" />
            <el-table-column prop="paymentStatusText" label="支付状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getPaymentStatusType(row.paymentStatus)">
                  {{ row.paymentStatusText }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 库存信息 -->
        <el-card class="inventory-card" shadow="hover" v-if="traceInfo.inventory">
          <template #header>
            <span>当前库存</span>
          </template>
          <el-descriptions :column="4" border>
            <el-descriptions-item label="仓库名称">{{ traceInfo.inventory.warehouseName }}</el-descriptions-item>
            <el-descriptions-item label="库存数量">
              {{ traceInfo.inventory.quantity }} {{ traceInfo.inventory.unit }}
            </el-descriptions-item>
            <el-descriptions-item label="仓库温度">{{ traceInfo.inventory.warehouseTemp || '-' }}</el-descriptions-item>
            <el-descriptions-item label="最后更新">{{ formatDateTime(traceInfo.inventory.lastUpdateTime) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <!-- 空状态 -->
      <el-empty v-else-if="!loading" description="请输入批次编号、产品编码或订单编号进行查询">
        <template #image>
          <el-icon :size="100" color="#909399">
            <Search />
          </el-icon>
        </template>
      </el-empty>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="8" animated />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download, Check, Clock, Box, Van, Grid, Shop } from '@element-plus/icons-vue'
import { queryByBatchNo, queryByOrderNo, queryTraceability, TraceabilityInfo } from '@/api/traceability'

const loading = ref(false)
const searchForm = reactive({
  batchNo: '',
  productCode: '',
  orderNo: ''
})

// 溯源信息
const traceInfo = ref<TraceabilityInfo | null>(null)

// 搜索
const handleSearch = () => {
  if (!searchForm.batchNo && !searchForm.productCode && !searchForm.orderNo) {
    ElMessage.warning('请输入批次编号、产品编码或订单编号')
    return
  }
  fetchTraceInfo()
}

// 重置
const handleReset = () => {
  searchForm.batchNo = ''
  searchForm.productCode = ''
  searchForm.orderNo = ''
  traceInfo.value = null
}

// 获取溯源信息
const fetchTraceInfo = async () => {
  loading.value = true
  try {
    let res

    // 优先根据批次编号查询
    if (searchForm.batchNo) {
      res = await queryByBatchNo(searchForm.batchNo)
    }
    // 根据订单编号查询
    else if (searchForm.orderNo) {
      res = await queryByOrderNo(searchForm.orderNo)
    }
    // 根据产品编码查询
    else if (searchForm.productCode) {
      const params: any = {}
      params.productCode = searchForm.productCode
      res = await queryTraceability(params)
    }

    // API 返回格式：{ code: 200, message: "操作成功", data: { ... } }
    // 响应拦截器已经返回了 res (即 response.data)，所以 res.data 才是溯源信息
    traceInfo.value = res.data || null

    if (!traceInfo.value) {
      ElMessage.warning('未找到相关溯源信息')
    }
  } catch (error: any) {
    console.error('获取溯源信息失败:', error)
    ElMessage.error(error.message || '获取溯源信息失败')
  } finally {
    loading.value = false
  }
}

// 导出报告
const handleExportReport = () => {
  ElMessage.success('报告导出功能待实现')
}

// 格式化日期
const formatDate = (date: string) => {
  return date || '-'
}

// 格式化日期时间
const formatDateTime = (date: string) => {
  return date || '-'
}

// 获取步骤图标
const getStepIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    Box,
    Check,
    Grid,
    Van,
    Shop
  }
  return iconMap[iconName] || Clock
}

// 获取图标颜色
const getIconColor = (stepType: string) => {
  const colorMap: Record<string, string> = {
    production: '#409EFF',
    quality: '#67C23A',
    warehouse: '#E6A23C',
    transport: '#F56C6C',
    sales: '#909399'
  }
  return colorMap[stepType] || '#409EFF'
}

// 获取标签类型
const getTagType = (tag: string) => {
  if (tag === '合格' || tag === 'PAID' || tag === 'IN') return 'success'
  if (tag === '不合格' || tag === 'REFUNDED' || tag === 'EXCEPTION') return 'danger'
  if (tag === '出库' || tag === '待运输') return 'warning'
  return 'info'
}

// 获取批次状态类型
const getBatchStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    PRODUCING: 'info',
    IN_WAREHOUSE: 'success',
    IN_TRANSPORT: 'warning',
    SOLD: 'success',
    ARCHIVED: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取批次状态文本
const getBatchStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    PRODUCING: '生产中',
    IN_WAREHOUSE: '已入库',
    IN_TRANSPORT: '运输中',
    SOLD: '已销售',
    ARCHIVED: '已归档'
  }
  return textMap[status] || status
}

// 获取运输状态类型
const getTransportStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    PENDING: 'info',
    IN_TRANSIT: 'warning',
    ARRIVED: 'success',
    EXCEPTION: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取支付状态类型
const getPaymentStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    PENDING: 'warning',
    PAID: 'success',
    REFUNDED: 'danger'
  }
  return typeMap[status] || 'info'
}
</script>

<style scoped>
.trace-query {
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

.trace-content {
  margin-top: 20px;
}

.product-info-card,
.batch-info-card,
.timeline-card,
.warehouse-card,
.transport-card,
.sales-card,
.inventory-card {
  margin-bottom: 20px;
}

.step-content {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.step-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.step-detail {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
}

.step-tags {
  margin-top: 8px;
}

.loading-container {
  padding: 20px;
}
</style>
