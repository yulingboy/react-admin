/**
 * 账单标签相关API
 */
import request from '@/utils/http';
import { 
  BillTag, 
  BillTagFormData, 
  BillTagQueryParams, 
  BillTagListResult 
} from '../types';

/**
 * 分页获取账单标签列表
 * @param params 查询参数
 */
export const getBillTagList = (params: BillTagQueryParams) => {
  return request.get<BillTagListResult>('/api/finance/bill-tags/list', { params });
};

/**
 * 获取账单标签详情
 * @param id 账单标签ID
 */
export const getBillTagDetail = (id: number) => {
  return request.get<BillTag>('/api/finance/bill-tags/detail', { params: { id } });
};

/**
 * 获取所有账单标签选项
 */
export const getBillTagOptions = () => {
  return request.get<BillTag[]>('/api/finance/bill-tags/options');
};

/**
 * 创建账单标签
 * @param data 账单标签数据
 */
export const createBillTag = (data: BillTagFormData) => {
  return request.post<BillTag>('/api/finance/bill-tags/add', data);
};

/**
 * 更新账单标签
 * @param data 账单标签数据
 */
export const updateBillTag = (data: BillTagFormData) => {
  return request.put<BillTag>('/api/finance/bill-tags/update', data);
};

/**
 * 删除账单标签
 * @param id 账单标签ID
 */
export const deleteBillTag = (id: number) => {
  return request.delete('/api/finance/bill-tags/delete', { params: { id } });
};

/**
 * 批量删除账单标签
 * @param ids 账单标签ID数组
 */
export const batchDeleteBillTags = (ids: number[]) => {
  return request.delete('/api/finance/bill-tags/deleteBatch', { data: { ids } });
};