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
