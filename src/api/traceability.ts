import request from './request'

/**
 * 产品分类相关 API
 */

/**
 * 获取所有产品分类
 */
export function getCategories() {
  return request.get('/traceability/categories')
}

/**
 * 根据 ID 获取产品分类
 */
export function getCategory(id: number) {
  return request.get(`/traceability/categories/${id}`)
}

/**
 * 创建产品分类
 */
export function createCategory(data: {
  name: string
  code: string
  parentId?: number
  sort?: number
  description?: string
  enabled?: boolean
}) {
  return request.post('/traceability/categories', data)
}

/**
 * 更新产品分类
 */
export function updateCategory(id: number, data: {
  name?: string
  code?: string
  parentId?: number
  sort?: number
  description?: string
  enabled?: boolean
}) {
  return request.put(`/traceability/categories/${id}`, data)
}

/**
 * 删除产品分类
 */
export function deleteCategory(id: number) {
  return request.delete(`/traceability/categories/${id}`)
}

/**
 * 产品相关 API
 */

export interface Product {
  id: number
  categoryId: number
  categoryName?: string
  name: string
  code: string
  specification?: string
  origin?: string
  shelfLife?: number
  storageTemp?: string
  description?: string
  imageUrl?: string
  enabled: boolean
  createTime: string
  updateTime: string
}

export interface ProductCreateParams {
  categoryId: number
  name: string
  code: string
  specification?: string
  origin?: string
  shelfLife?: number
  storageTemp?: string
  description?: string
  imageUrl?: string
  enabled?: boolean
}

export interface ProductUpdateParams {
  categoryId?: number
  name?: string
  code?: string
  specification?: string
  origin?: string
  shelfLife?: number
  storageTemp?: string
  description?: string
  imageUrl?: string
  enabled?: boolean
}

export interface ProductQueryParams {
  pageNum: number
  pageSize: number
  name?: string
  code?: string
  categoryId?: number
  origin?: string
}

export interface ProductListResponse {
  records: Product[]
  total: number
  size: number
  current: number
  orders: any[]
  optimizeCountSql: boolean
  searchCount: boolean
  maxLimit: any
  optimizeJoinOfCountSql: boolean
  countId: any
  pages: number
}

/**
 * 获取产品列表（分页）
 */
export function getProducts(params: ProductQueryParams) {
  return request.get('/traceability/products', { params })
}

/**
 * 获取产品详情
 */
export function getProduct(id: number) {
  return request.get(`/traceability/products/${id}`)
}

/**
 * 创建产品
 */
export function createProduct(data: ProductCreateParams) {
  return request.post('/traceability/products', data)
}

/**
 * 更新产品
 */
export function updateProduct(id: number, data: ProductUpdateParams) {
  return request.put(`/traceability/products/${id}`, data)
}

/**
 * 删除产品
 */
export function deleteProduct(id: number) {
  return request.delete(`/traceability/products/${id}`)
}

/**
 * 批次相关 API
 */

export interface Batch {
  id: number
  productId: number
  productName?: string
  productCode?: string
  categoryName?: string
  batchNo: string
  productionDate: string
  quantity: number
  unit: string
  producer?: string
  productionLocation?: string
  qualityResult?: string
  qualityChecker?: string
  qualityTime?: string
  qualityReportUrl?: string
  status: string
  statusText?: string
  remark?: string
  createTime: string
  updateTime: string
}

export interface BatchCreateParams {
  productId: number
  batchNo: string
  productionDate: string
  quantity: number
  unit: string
  producer?: string
  productionLocation?: string
  qualityResult?: string
  qualityChecker?: string
  qualityReportUrl?: string
  status?: string
  remark?: string
}

export interface BatchUpdateParams {
  productId?: number
  batchNo?: string
  productionDate?: string
  quantity?: number
  unit?: string
  producer?: string
  productionLocation?: string
  qualityResult?: string
  qualityChecker?: string
  qualityReportUrl?: string
  status?: string
  remark?: string
}

export interface BatchQueryParams {
  pageNum: number
  pageSize: number
  batchNo?: string
  productId?: number
  productName?: string
  status?: string
  qualityResult?: string
  productionDateStart?: string
  productionDateEnd?: string
}

/**
 * 获取批次列表（分页）
 */
export function getBatches(params: BatchQueryParams) {
  return request.get('/traceability/batches', { params })
}

/**
 * 获取批次详情
 */
export function getBatch(id: number) {
  return request.get(`/traceability/batches/${id}`)
}

/**
 * 创建批次
 */
export function createBatch(data: BatchCreateParams) {
  return request.post('/traceability/batches', data)
}

/**
 * 更新批次
 */
export function updateBatch(id: number, data: BatchUpdateParams) {
  return request.put(`/traceability/batches/${id}`, data)
}

/**
 * 删除批次
 */
export function deleteBatch(id: number) {
  return request.delete(`/traceability/batches/${id}`)
}

/**
 * 更新批次质检结果
 */
export function updateBatchQuality(
  id: number,
  qualityResult: string,
  qualityChecker?: string,
  qualityReportUrl?: string
) {
  return request.put(`/traceability/batches/${id}/quality`, null, {
    params: { qualityResult, qualityChecker, qualityReportUrl }
  })
}

/**
 * 更新批次状态
 */
export function updateBatchStatus(id: number, status: string) {
  return request.put(`/traceability/batches/${id}/status`, null, {
    params: { status }
  })
}

/**
 * 运输管理相关 API
 */

export interface TransportRecord {
  id: number
  batchId: number
  batchNo?: string
  productName?: string
  transportNo: string
  vehicleNo: string
  driverName: string
  driverPhone: string
  departurePlace: string
  destination: string
  plannedDepartureTime?: string
  plannedArrivalTime?: string
  actualDepartureTime?: string
  actualArrivalTime?: string
  status: string
  statusText?: string
  exceptionDesc?: string
  remark?: string
  createTime: string
  updateTime: string
  temperatureRecords?: TemperatureRecord[]
}

export interface TemperatureRecord {
  id: number
  transportId: number
  recordTime: string
  temperature: number
  location?: string
  deviceId?: string
  remark?: string
  createTime: string
}

export interface TransportRecordCreateParams {
  batchId: number
  transportNo: string
  vehicleNo: string
  driverName: string
  driverPhone: string
  departurePlace: string
  destination: string
  plannedDepartureTime?: string
  plannedArrivalTime?: string
  status?: string
  remark?: string
}

export interface TransportRecordUpdateParams {
  batchId?: number
  transportNo?: string
  vehicleNo?: string
  driverName?: string
  driverPhone?: string
  departurePlace?: string
  destination?: string
  plannedDepartureTime?: string
  plannedArrivalTime?: string
  actualDepartureTime?: string
  actualArrivalTime?: string
  status?: string
  exceptionDesc?: string
  remark?: string
}

export interface TransportRecordQueryParams {
  pageNum: number
  pageSize: number
  transportNo?: string
  batchNo?: string
  batchId?: number
  vehicleNo?: string
  driverName?: string
  status?: string
  departurePlace?: string
  destination?: string
  plannedDepartureTimeStart?: string
  plannedDepartureTimeEnd?: string
}

export interface TemperatureRecordDTO {
  recordTime?: string
  temperature: number
  location?: string
  deviceId?: string
  remark?: string
}

/**
 * 获取运输记录列表（分页）
 */
export function getTransportRecords(params: TransportRecordQueryParams) {
  return request.get('/traceability/transports', { params })
}

/**
 * 获取运输记录详情
 */
export function getTransportRecord(id: number) {
  return request.get(`/traceability/transports/${id}`)
}

/**
 * 创建运输记录
 */
export function createTransportRecord(data: TransportRecordCreateParams) {
  return request.post('/traceability/transports', data)
}

/**
 * 更新运输记录
 */
export function updateTransportRecord(id: number, data: TransportRecordUpdateParams) {
  return request.put(`/traceability/transports/${id}`, data)
}

/**
 * 删除运输记录
 */
export function deleteTransportRecord(id: number) {
  return request.delete(`/traceability/transports/${id}`)
}

/**
 * 更新运输状态
 */
export function updateTransportStatus(id: number, status: string) {
  return request.put(`/traceability/transports/${id}/status`, null, {
    params: { status }
  })
}

/**
 * 添加异常记录
 */
export function addException(id: number, exceptionDesc: string) {
  return request.put(`/traceability/transports/${id}/exception`, null, {
    params: { exceptionDesc }
  })
}

/**
 * 添加温度记录
 */
export function addTemperatureRecord(transportId: number, data: TemperatureRecordDTO) {
  return request.post(`/traceability/transports/${transportId}/temperatures`, data)
}

/**
 * 获取温度记录列表
 */
export function getTemperatureRecords(transportId: number) {
  return request.get(`/traceability/transports/${transportId}/temperatures`)
}

// ==================== 仓储管理相关 API ====================

export interface WarehouseRecord {
  id: number
  batchId: number
  batchNo?: string
  productName?: string
  recordNo: string
  recordType: string
  recordTypeText?: string
  warehouseName: string
  quantity: number
  unit: string
  warehouseTemp?: string
  operateTime: string
  operator: string
  remark?: string
  createTime: string
  updateTime: string
}

export interface Inventory {
  id: number
  batchId: number
  batchNo?: string
  productName?: string
  warehouseName: string
  quantity: number
  unit: string
  warehouseTemp?: string
  inTime?: string
  lastUpdateTime: string
  createTime: string
  updateTime: string
}

export interface WarehouseRecordCreateParams {
  batchId: number
  recordNo: string
  recordType: string
  warehouseName: string
  quantity: number
  unit: string
  warehouseTemp?: string
  operateTime?: string
  operator: string
  remark?: string
}

export interface WarehouseRecordUpdateParams {
  batchId?: number
  recordNo?: string
  recordType?: string
  warehouseName?: string
  quantity?: number
  unit?: string
  warehouseTemp?: string
  operateTime?: string
  operator?: string
  remark?: string
}

export interface WarehouseRecordQueryParams {
  pageNum: number
  pageSize: number
  recordNo?: string
  batchNo?: string
  batchId?: number
  recordType?: string
  warehouseName?: string
  operator?: string
  operateTimeStart?: string
  operateTimeEnd?: string
}

export interface InventoryQueryParams {
  batchId?: number
  warehouseName?: string
}

/**
 * 获取仓储记录列表（分页）
 */
export function getWarehouseRecords(params: WarehouseRecordQueryParams) {
  return request.get('/traceability/warehouse/records', { params })
}

/**
 * 获取仓储记录详情
 */
export function getWarehouseRecord(id: number) {
  return request.get(`/traceability/warehouse/records/${id}`)
}

/**
 * 创建仓储记录
 */
export function createWarehouseRecord(data: WarehouseRecordCreateParams) {
  return request.post('/traceability/warehouse/records', data)
}

/**
 * 更新仓储记录
 */
export function updateWarehouseRecord(id: number, data: WarehouseRecordUpdateParams) {
  return request.put(`/traceability/warehouse/records/${id}`, data)
}

/**
 * 删除仓储记录
 */
export function deleteWarehouseRecord(id: number) {
  return request.delete(`/traceability/warehouse/records/${id}`)
}

/**
 * 获取库存列表
 */
export function getInventoryList(params?: InventoryQueryParams) {
  return request.get('/traceability/warehouse/inventory', { params })
}

/**
 * 获取库存详情
 */
export function getInventory(id: number) {
  return request.get(`/traceability/warehouse/inventory/${id}`)
}

/**
 * 根据批次 ID 获取库存
 */
export function getInventoryByBatchId(batchId: number) {
  return request.get(`/traceability/warehouse/inventory/batch/${batchId}`)
}

/**
 * 入库操作（快捷接口）
 */
export function inbound(data: WarehouseRecordCreateParams) {
  return request.post('/traceability/warehouse/inventory/in', data)
}

/**
 * 出库操作（快捷接口）
 */
export function outbound(data: WarehouseRecordCreateParams) {
  return request.post('/traceability/warehouse/inventory/out', data)
}

// ==================== 销售管理相关 API ====================

export interface SalesRecord {
  id: number
  batchId: number
  batchNo?: string
  productName?: string
  orderNo: string
  customerName: string
  customerType: string
  customerTypeText?: string
  customerContact?: string
  quantity: number
  unit: string
  unitPrice: number
  totalAmount: number
  saleDate: string
  salesperson: string
  paymentStatus: string
  paymentStatusText?: string
  remark?: string
  createTime: string
  updateTime: string
}

export interface SalesRecordCreateParams {
  batchId: number
  orderNo: string
  customerName: string
  customerType: string
  customerContact?: string
  quantity: number
  unit: string
  unitPrice: number
  saleDate: string
  salesperson: string
  paymentStatus?: string
  remark?: string
}

export interface SalesRecordUpdateParams {
  batchId?: number
  orderNo?: string
  customerName?: string
  customerType?: string
  customerContact?: string
  quantity?: number
  unit?: string
  unitPrice?: number
  saleDate?: string
  salesperson?: string
  paymentStatus?: string
  remark?: string
}

export interface SalesRecordQueryParams {
  pageNum: number
  pageSize: number
  orderNo?: string
  batchNo?: string
  batchId?: number
  customerName?: string
  customerType?: string
  paymentStatus?: string
  salesperson?: string
  saleDateStart?: string
  saleDateEnd?: string
}

/**
 * 获取销售记录列表（分页）
 */
export function getSalesRecords(params: SalesRecordQueryParams) {
  return request.get('/traceability/sales/records', { params })
}

/**
 * 获取销售记录详情
 */
export function getSalesRecord(id: number) {
  return request.get(`/traceability/sales/records/${id}`)
}

/**
 * 创建销售记录
 */
export function createSalesRecord(data: SalesRecordCreateParams) {
  return request.post('/traceability/sales/records', data)
}

/**
 * 更新销售记录
 */
export function updateSalesRecord(id: number, data: SalesRecordUpdateParams) {
  return request.put(`/traceability/sales/records/${id}`, data)
}

/**
 * 删除销售记录
 */
export function deleteSalesRecord(id: number) {
  return request.delete(`/traceability/sales/records/${id}`)
}

/**
 * 更新支付状态
 */
export function updatePaymentStatus(id: number, paymentStatus: string) {
  return request.put(`/traceability/sales/records/${id}/payment`, null, {
    params: { paymentStatus }
  })
}

/**
 * 根据批次 ID 获取销售记录列表
 */
export function getSalesRecordsByBatchId(batchId: number) {
  return request.get(`/traceability/sales/batch/${batchId}`)
}

// ==================== 溯源查询相关 API ====================

export interface TraceabilityInfo {
  productInfo?: ProductBasicInfo
  batchInfo?: ProductionBatchInfo
  warehouseRecords?: WarehouseRecord[]
  transportRecords?: TransportRecord[]
  salesRecords?: SalesRecord[]
  inventory?: Inventory
  timeline?: TraceStep[]
}

export interface ProductBasicInfo {
  productId: number
  productName: string
  productCode: string
  specification?: string
  origin?: string
  shelfLife?: number
  storageTemp?: string
  description?: string
  categoryName?: string
}

export interface ProductionBatchInfo {
  batchId: number
  batchNo: string
  productionDate: string
  quantity: string
  unit: string
  producer?: string
  productionLocation?: string
  qualityResult?: string
  qualityChecker?: string
  qualityTime?: string
  qualityReportUrl?: string
  status: string
}

export interface TraceStep {
  stepOrder: number
  stepType: string
  stepTypeText: string
  title: string
  description: string
  time: string
  detail: string
  tags: string[]
  icon: string
  status?: string
}

export interface TraceabilityQueryParams {
  batchNo?: string
  productName?: string
  productCode?: string
  orderNo?: string
  startDate?: string
  endDate?: string
}

/**
 * 根据批次编号查询溯源信息
 */
export function queryByBatchNo(batchNo: string) {
  return request.get(`/traceability/query/batch/${batchNo}`)
}

/**
 * 根据产品 ID 查询溯源信息
 */
export function queryByProductId(productId: number) {
  return request.get(`/traceability/query/product/${productId}`)
}

/**
 * 根据订单编号查询溯源信息
 */
export function queryByOrderNo(orderNo: string) {
  return request.get(`/traceability/query/order/${orderNo}`)
}

/**
 * 综合查询溯源信息
 */
export function queryTraceability(params: TraceabilityQueryParams) {
  return request.post('/traceability/query', params)
}

// ==================== 仪表盘统计相关 API ====================

export interface DashboardStatResponse {
  productCount: number
  batchCount: number
  transportCount: number
  salesAmount: string | number
  categoryDistribution: CategoryStat[]
  salesTrend: SalesTrendStat[]
  transportStatus: TransportStatusStat
  warehouseInventory: WarehouseInventoryStat[]
}

export interface CategoryStat {
  value: number
  name: string
  color: string
}

export interface SalesTrendStat {
  date: string
  amount: string | number
}

export interface TransportStatusStat {
  pending: number
  inTransit: number
  arrived: number
  exception: number
}

export interface WarehouseInventoryStat {
  warehouseName: string
  quantity: string | number
  unit: string
}

/**
 * 获取仪表盘统计数据
 * @param period 时间范围：today-今日，week-本周，month-本月
 */
export function getDashboardStatistics(period: string = 'month') {
  return request.get('/traceability/dashboard/statistics', { params: { period } })
}
