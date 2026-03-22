<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>首页 - 生鲜冷链溯源管理系统</h2>
      <p>欢迎使用生鲜冷链溯源管理系统，以下是系统概览</p>
    </div>

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
              <el-select v-model="chartPeriod" size="small" @change="handleChartPeriodChange">
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
              <el-select v-model="chartPeriod" size="small" @change="handleChartPeriodChange">
                <el-option label="今日" value="today" />
                <el-option label="本周" value="week" />
                <el-option label="本月" value="month" />
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
import { getDashboardStatistics } from '@/api/traceability'

const productChartRef = ref<HTMLElement>()
const salesChartRef = ref<HTMLElement>()
const transportChartRef = ref<HTMLElement>()
const inventoryChartRef = ref<HTMLElement>()

// 统一的时间范围选择器
const chartPeriod = ref('month')

// 统计数据
const statData = ref({
  productCount: 0,
  batchCount: 0,
  transportCount: 0,
  salesAmount: '0'
})

// 图表数据
const categoryData = ref<any[]>([])
const salesTrendData = ref<any[]>([])
const transportStatusData = ref<any[]>([])
const inventoryData = ref<any[]>([])

// 图表实例
let productChart: echarts.ECharts | null = null
let salesChart: echarts.ECharts | null = null
let transportChart: echarts.ECharts | null = null
let inventoryChart: echarts.ECharts | null = null

// 获取统计数据
const fetchStatData = async (period: string = 'month') => {
  try {
    const res = await getDashboardStatistics(period)

    // 响应拦截器返回的是完整响应对象 { code, message, data }
    const data = res.data

    if (!data) {
      console.error('API 返回数据格式异常', res)
      useMockData()
      return
    }

    // 更新统计数据
    statData.value = {
      productCount: data.productCount || 0,
      batchCount: data.batchCount || 0,
      transportCount: data.transportCount || 0,
      salesAmount: data.salesAmount ? formatCurrency(data.salesAmount) : '0'
    }

    // 更新图表数据
    categoryData.value = data.categoryDistribution || []

    // 销售趋势数据格式转换
    salesTrendData.value = (data.salesTrend || []).map((item: any) => ({
      date: item.date,
      amount: Number(item.amount) || 0
    }))

    // 运输状态统计
    transportStatusData.value = [
      { value: data.transportStatus?.pending || 0, name: '待运输', itemStyle: { color: '#E6A23C' } },
      { value: data.transportStatus?.inTransit || 0, name: '运输中', itemStyle: { color: '#409EFF' } },
      { value: data.transportStatus?.arrived || 0, name: '已到达', itemStyle: { color: '#67C23A' } },
      { value: data.transportStatus?.exception || 0, name: '异常', itemStyle: { color: '#F56C6C' } }
    ]

    // 仓库库存统计 - 按仓库名称聚合
    const inventoryMap = new Map<string, number>()
    const inventoryUnitMap = new Map<string, string>()

    ;(data.warehouseInventory || []).forEach((item: any) => {
      const warehouseName = item.warehouseName
      const quantity = Number(item.quantity) || 0

      if (inventoryMap.has(warehouseName)) {
        inventoryMap.set(warehouseName, inventoryMap.get(warehouseName)! + quantity)
      } else {
        inventoryMap.set(warehouseName, quantity)
        inventoryUnitMap.set(warehouseName, item.unit || 'box')
      }
    })

    inventoryData.value = Array.from(inventoryMap.entries()).map(([name, quantity], index) => ({
      value: quantity,
      name: name,
      itemStyle: { color: getRandomColor() }
    }))
  } catch (error) {
    console.error('获取统计数据失败:', error)
    // 使用默认模拟数据
    useMockData()
  }
}

// 使用模拟数据（当 API 调用失败时）
const useMockData = () => {
  statData.value = {
    productCount: 128,
    batchCount: 356,
    transportCount: 89,
    salesAmount: '1,234,567.89'
  }

  categoryData.value = [
    { value: 45, name: '蔬菜', itemStyle: { color: '#67C23A' } },
    { value: 38, name: '水果', itemStyle: { color: '#E6A23C' } },
    { value: 25, name: '肉类', itemStyle: { color: '#F56C6C' } },
    { value: 12, name: '水产', itemStyle: { color: '#409EFF' } },
    { value: 8, name: '乳制品', itemStyle: { color: '#909399' } }
  ]

  salesTrendData.value = [
    { date: '03-14', amount: 12000 },
    { date: '03-15', amount: 15000 },
    { date: '03-16', amount: 18000 },
    { date: '03-17', amount: 14000 },
    { date: '03-18', amount: 22000 },
    { date: '03-19', amount: 28000 },
    { date: '03-20', amount: 25000 }
  ]

  transportStatusData.value = [
    { value: 15, name: '待运输', itemStyle: { color: '#E6A23C' } },
    { value: 28, name: '运输中', itemStyle: { color: '#409EFF' } },
    { value: 42, name: '已到达', itemStyle: { color: '#67C23A' } },
    { value: 4, name: '异常', itemStyle: { color: '#F56C6C' } }
  ]

  inventoryData.value = [
    { value: 5000, name: '烟台仓库', itemStyle: { color: '#409EFF' } },
    { value: 3500, name: '北京仓库', itemStyle: { color: '#67C23A' } },
    { value: 2800, name: '上海仓库', itemStyle: { color: '#E6A23C' } },
    { value: 2200, name: '广州仓库', itemStyle: { color: '#F56C6C' } }
  ]
}

// 格式化货币
const formatCurrency = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// 生成随机颜色
const getRandomColor = (): string => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#20A0FF', '#39B54A', '#FF6B6B']
  return colors[Math.floor(Math.random() * colors.length)]
}

// 初始化产品分布图表
const initProductChart = () => {
  if (!productChartRef.value) return

  productChart = echarts.init(productChartRef.value)

  // 使用 categoryData.value 的数据，如果为空则显示空数组
  const chartData = categoryData.value.length > 0
    ? categoryData.value.map(item => ({
        value: item.value,
        name: item.name,
        itemStyle: { color: item.color }
      }))
    : []

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (!params || params.dataIndex === undefined) {
          return '暂无数据'
        }
        const total = categoryData.value.reduce((sum, item) => sum + (item.value || 0), 0)
        const percent = total > 0 ? ((params.value / total) * 100).toFixed(1) : '0'
        return `${params.name}<br/>数量：${params.value} (${percent}%)`
      }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: categoryData.value.length > 0 ? categoryData.value.map(item => item.name) : []
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
          show: categoryData.value.length > 0,
          formatter: '{b}: {c}'
        },
        emptyCircleStyle: {
          color: '#f5f5f5'
        },
        data: chartData
      }
    ]
  }

  // 如果没有数据，添加空状态提示
  if (chartData.length === 0) {
    option.title = {
      text: '暂无数据',
      left: 'center',
      top: 'center'
    }
  }

  productChart.setOption(option, true)
}

// 初始化销售趋势图表
const initSalesChart = () => {
  if (!salesChartRef.value) return

  salesChart = echarts.init(salesChartRef.value)

  // 如果没有数据，使用默认数据
  const chartData = salesTrendData.value.length > 0
    ? salesTrendData.value
    : [
        { date: '03-14', amount: 12000 },
        { date: '03-15', amount: 15000 },
        { date: '03-16', amount: 18000 },
        { date: '03-17', amount: 14000 },
        { date: '03-18', amount: 22000 },
        { date: '03-19', amount: 28000 },
        { date: '03-20', amount: 25000 }
      ]

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const item = params[0]
        const value = typeof item.value === 'number' ? item.value.toLocaleString() : item.value
        return `${item.name}<br/>销售额：¥${value}`
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
      boundaryGap: false,
      data: chartData.map(item => item.date)
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
        data: chartData.map(item => item.amount)
      }
    ]
  }

  salesChart.setOption(option)
}

// 初始化运输统计图表
const initTransportChart = () => {
  if (!transportChartRef.value) return

  transportChart = echarts.init(transportChartRef.value)

  // 如果没有数据，使用默认数据
  const chartData = transportStatusData.value.length > 0
    ? transportStatusData.value
    : [
        { value: 15, name: '待运输', itemStyle: { color: '#E6A23C' } },
        { value: 28, name: '运输中', itemStyle: { color: '#409EFF' } },
        { value: 42, name: '已到达', itemStyle: { color: '#67C23A' } },
        { value: 4, name: '异常', itemStyle: { color: '#F56C6C' } }
      ]

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const item = params[0]
        return `${item.name}<br/>数量：${item.value}`
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
      data: chartData.map(item => item.name)
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        data: chartData,
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

  // 如果没有数据，使用默认数据
  const chartData = inventoryData.value.length > 0
    ? inventoryData.value
    : [
        { value: 5000, name: '烟台仓库', itemStyle: { color: '#409EFF' } },
        { value: 3500, name: '北京仓库', itemStyle: { color: '#67C23A' } },
        { value: 2800, name: '上海仓库', itemStyle: { color: '#E6A23C' } },
        { value: 2200, name: '广州仓库', itemStyle: { color: '#F56C6C' } }
      ]

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const item = params[0]
        return `${item.name}<br/>库存量：${item.value}`
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
      data: chartData.map(item => item.name)
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
        data: chartData,
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
  // 确保数据加载完成后再初始化图表
  if (productChart) {
    productChart.dispose()
  }
  if (salesChart) {
    salesChart.dispose()
  }
  if (transportChart) {
    transportChart.dispose()
  }
  if (inventoryChart) {
    inventoryChart.dispose()
  }

  initProductChart()
  initSalesChart()
  initTransportChart()
  initInventoryChart()
}

// 处理图表时间范围变化
const handleChartPeriodChange = async () => {
  await fetchStatData(chartPeriod.value)
  refreshCharts()
}

// 监听窗口大小变化
const handleResize = () => {
  productChart?.resize()
  salesChart?.resize()
  transportChart?.resize()
  inventoryChart?.resize()
}

onMounted(() => {
  // 先获取数据，数据加载完成后再初始化图表
  fetchStatData('month').then(() => {
    refreshCharts()
  })
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
.dashboard {
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 20px;
}

.dashboard-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
}

.dashboard-header p {
  margin: 0;
  color: #909399;
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
