import request from './request'
import type { PageResult } from '@/types/common'

/**
 * 供应商查询参数
 */
export interface SupplierQueryParams {
  pageNum?: number
  pageSize?: number
  keyword?: string
  status?: string
  creditRating?: string
  enabled?: number
}

/**
 * 供应商信息
 */
export interface Supplier {
  id?: number
  code: string
  name: string
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  address?: string
  businessLicense?: string
  taxNumber?: string
  bankName?: string
  bankAccount?: string
  creditRating?: string
  status?: string
  remark?: string
  enabled?: number
  createTime?: string
  updateTime?: string
  statusText?: string
  creditRatingText?: string
  enabledText?: string
}

/**
 * 供应商创建/更新参数
 */
export interface SupplierDTO {
  id?: number
  code: string
  name: string
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  address?: string
  businessLicense?: string
  taxNumber?: string
  bankName?: string
  bankAccount?: string
  creditRating?: string
  status?: string
  remark?: string
  enabled?: number
}

/**
 * 产品分类相关类型
 */
export interface Category {
  id: number
  name: string
  code: string
  parentId: number | null
  icon: string | null
  sort: number
  description: string | null
  enabled: boolean
  createTime: string
  updateTime: string
  children?: Category[]
}

export interface CategoryCreateParams {
  name: string
  code: string
  parentId?: number
  sort?: number
  description?: string
  enabled?: boolean
}

export interface CategoryUpdateParams {
  name?: string
  code?: string
  parentId?: number
  sort?: number
  description?: string
  enabled?: boolean
}

/**
 * 产品相关类型
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

/**
 * 供应商相关 API
 */

/**
 * 分页查询供应商
 */
export function getSupplierList(params: SupplierQueryParams) {
  return request<PageResult<Supplier>>({
    url: '/supply/supplier/page',
    method: 'get',
    params
  })
}

/**
 * 根据 ID 获取供应商
 */
export function getSupplierById(id: number) {
  return request<Supplier>({
    url: `/supply/supplier/${id}`,
    method: 'get'
  })
}

/**
 * 创建供应商
 */
export function createSupplier(data: SupplierDTO) {
  return request<Supplier>({
    url: '/supply/supplier',
    method: 'post',
    data
  })
}

/**
 * 更新供应商
 */
export function updateSupplier(id: number, data: SupplierDTO) {
  return request<Supplier>({
    url: `/supply/supplier/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除供应商
 */
export function deleteSupplier(id: number) {
  return request({
    url: `/supply/supplier/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除供应商
 */
export function batchDeleteSuppliers(ids: number[]) {
  return request({
    url: '/supply/supplier/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 启用/禁用供应商
 */
export function toggleSupplierStatus(id: number, enabled: number) {
  return request({
    url: `/supply/supplier/${id}/status`,
    method: 'put',
    params: { enabled }
  })
}

/**
 * 批量启用/禁用供应商
 */
export function batchToggleStatus(ids: number[], enabled: number) {
  return request({
    url: '/supply/supplier/batch/status',
    method: 'put',
    params: { enabled },
    data: ids
  })
}

/**
 * 检查供应商编码是否存在
 */
export function checkCodeExists(code: string, excludeId?: number) {
  return request<boolean>({
    url: '/supply/supplier/check-code',
    method: 'get',
    params: { code, excludeId }
  })
}

/**
 * 产品分类相关 API
 */

/**
 * 获取所有产品分类
 */
export function getCategories() {
  return request.get('/supply/categories')
}

/**
 * 根据 ID 获取产品分类
 */
export function getCategory(id: number) {
  return request.get(`/supply/categories/${id}`)
}

/**
 * 创建产品分类
 */
export function createCategory(data: CategoryCreateParams) {
  return request.post('/supply/categories', data)
}

/**
 * 更新产品分类
 */
export function updateCategory(id: number, data: CategoryUpdateParams) {
  return request.put(`/supply/categories/${id}`, data)
}

/**
 * 删除产品分类
 */
export function deleteCategory(id: number) {
  return request.delete(`/supply/categories/${id}`)
}

/**
 * 产品相关 API
 */

/**
 * 获取产品列表（分页）
 */
export function getProducts(params: ProductQueryParams) {
  return request.get('/supply/products', { params })
}

/**
 * 获取产品详情
 */
export function getProduct(id: number) {
  return request.get(`/supply/products/${id}`)
}

/**
 * 创建产品
 */
export function createProduct(data: ProductCreateParams) {
  return request.post('/supply/products', data)
}

/**
 * 更新产品
 */
export function updateProduct(id: number, data: ProductUpdateParams) {
  return request.put(`/supply/products/${id}`, data)
}

/**
 * 删除产品
 */
export function deleteProduct(id: number) {
  return request.delete(`/supply/products/${id}`)
}
