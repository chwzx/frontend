<template>
  <div class="stat-management">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon product">
              <el-icon :size="40"><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statData.productCount }}</div>
              <div class="stat-label">产品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon batch">
              <el-icon :size="40"><Files /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statData.batchCount }}</div>
              <div class="stat-label">批次总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon transport">
              <el-icon :size="40"><Van /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statData.transportCount }}</div>
              <div class="stat-label">运输次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon sales">
              <el-icon :size="40"><Shop /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ statData.salesAmount }}</div>
              <div class="stat-label">销售总额</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 产品分布 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>产品分类分布</span>
              <el-select v-model="productChartPeriod" size="small">
                <el-option label="今日" value="today" />
                <el-option label="本周" value="week" />
                <el-option label="本月" value="month" />
              </el-select>
            </div>
          </template>
          <div ref="productChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 销售趋势 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>销售趋势</span>
              <el-select v-model="salesChartPeriod" size="small">
                <el-option label="近 7 天" value="7" />
                <el-option label="近 30 天" value="30" />
                <el-option label="近 90 天" value="90" />
              </el-select>
            </div>
          </template>
          <div ref="salesChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <!-- 运输统计 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>运输状态统计</span>
            </div>
          </template>
          <div ref="transportChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 库存统计 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>仓库库存统计</span>
            </div>
          </template>
          <div ref="inventoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { Box, Files, Van, Shop, Grid } from '@element-plus/icons-vue'

const productChartRef = ref<HTMLElement>()
const salesChartRef = ref<HTMLElement>()
const transportChartRef = ref<HTMLElement>()
const inventoryChartRef = ref<HTMLElement>()

const productChartPeriod = ref('month')
const salesChartPeriod = ref('30')

// 统计数据
const statData = ref({
  productCount: 0,
  batchCount: 0,
  transportCount: 0,
  salesAmount: 0
})

// 图表实例
let productChart: echarts.ECharts | null = null
let salesChart: echarts.ECharts | null = null
let transportChart: echarts.ECharts | null = null
let inventoryChart: echarts.ECharts | null = null

// 获取统计数据
const fetchStatData = async () => {
  try {
    // TODO: 调用统计 API
    // const res = await getOverviewStat()
    // statData.value = res.data

    // 模拟数据
    statData.value = {
      productCount: 128,
      batchCount: 356,
      transportCount: 89,
      salesAmount: '1,234,567.89'
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 初始化产品分布图表
const initProductChart = () => {
  if (!productChartRef.value) return

  productChart = echarts.init(productChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        name: '产品数量',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
        },
        data: [
          { value: 45, name: '蔬菜', itemStyle: { color: '#67C23A' } },
          { value: 38, name: '水果', itemStyle: { color: '#E6A23C' } },
          { value: 25, name: '肉类', itemStyle: { color: '#F56C6C' } },
          { value: 12, name: '水产', itemStyle: { color: '#409EFF' } },
          { value: 8, name: '乳制品', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  }

  productChart.setOption(option)
}

// 初始化销售趋势图表
const initSalesChart = () => {
  if (!salesChartRef.value) return

  salesChart = echarts.init(salesChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['03-14', '03-15', '03-16', '03-17', '03-18', '03-19', '03-20']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        },
        itemStyle: {
          color: '#409EFF'
        },
        data: [12000, 15000, 18000, 14000, 22000, 28000, 25000]
      }
    ]
  }

  salesChart.setOption(option)
}

// 初始化运输统计图表
const initTransportChart = () => {
  if (!transportChartRef.value) return

  transportChart = echarts.init(transportChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['待运输', '运输中', '已到达', '异常']
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        data: [
          { value: 15, itemStyle: { color: '#E6A23C' } },
          { value: 28, itemStyle: { color: '#409EFF' } },
          { value: 42, itemStyle: { color: '#67C23A' } },
          { value: 4, itemStyle: { color: '#F56C6C' } }
        ],
        label: {
          show: true,
          position: 'right'
        }
      }
    ]
  }

  transportChart.setOption(option)
}

// 初始化库存统计图表
const initInventoryChart = () => {
  if (!inventoryChartRef.value) return

  inventoryChart = echarts.init(inventoryChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['烟台仓库', '北京仓库', '上海仓库', '广州仓库']
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: [
      {
        name: '库存量',
        type: 'bar',
        barWidth: '40%',
        data: [
          { value: 5000, itemStyle: { color: '#409EFF' } },
          { value: 3500, itemStyle: { color: '#67C23A' } },
          { value: 2800, itemStyle: { color: '#E6A23C' } },
          { value: 2200, itemStyle: { color: '#F56C6C' } }
        ],
        label: {
          show: true,
          position: 'top'
        }
      }
    ]
  }

  inventoryChart.setOption(option)
}

// 刷新所有图表
const refreshCharts = () => {
  initProductChart()
  initSalesChart()
  initTransportChart()
  initInventoryChart()
}

// 监听窗口大小变化
const handleResize = () => {
  productChart?.resize()
  salesChart?.resize()
  transportChart?.resize()
  inventoryChart?.resize()
}

onMounted(() => {
  fetchStatData()
  refreshCharts()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  productChart?.dispose()
  salesChart?.dispose()
  transportChart?.dispose()
  inventoryChart?.dispose()
})
</script>

<style scoped>
.stat-management {
  padding: 20px;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 10px;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #fff;
  margin-right: 20px;
}

.stat-icon.product {
  background: linear-gradient(135deg, #67C23A, #85ce61);
}

.stat-icon.batch {
  background: linear-gradient(135deg, #E6A23C, #ebb563);
}

.stat-icon.transport {
  background: linear-gradient(135deg, #409EFF, #5d9cec);
}

.stat-icon.sales {
  background: linear-gradient(135deg, #F56C6C, #f77676);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.charts-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
}
</style>
