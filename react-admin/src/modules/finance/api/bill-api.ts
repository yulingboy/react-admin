/**
 * 账单相关API
 */
import request from '@/utils/http';
import { 
  Bill, 
  BillFormData, 
  BillQueryParams, 
  BillListResult 
} from '../types';

/**
 * 分页获取账单列表
 * @param params 查询参数
 */
export const getBillList = (params: BillQueryParams) => {
  return request.get<BillListResult>('/api/finance/bills/list', { params });
};

/**
 * 获取账单详情
 * @param id 账单ID
 */
export const getBillDetail = (id: number) => {
  return request.get<Bill>('/api/finance/bills/detail', { params: { id } });
};

/**
 * 创建账单
 * @param data 账单数据
 */
export const createBill = (data: BillFormData) => {
  return request.post<Bill>('/api/finance/bills/add', data);
};

/**
 * 更新账单
 * @param data 账单数据
 */
export const updateBill = (data: BillFormData) => {
  return request.put<Bill>('/api/finance/bills/update', data);
};

/**
 * 删除账单
 * @param id 账单ID
 */
export const deleteBill = (id: number) => {
  return request.delete('/api/finance/bills/delete', { params: { id } });
};

/**
 * 批量删除账单
 * @param ids 账单ID数组
 */
export const batchDeleteBills = (ids: number[]) => {
  return request.delete('/api/finance/bills/deleteBatch', { data: { ids } });
};

/**
 * 导出账单数据
 * @param params 导出查询参数
 */
export const exportBills = (params: BillQueryParams) => {
  return request.post('/api/finance/bills/export', params, { 
    responseType: 'blob'
  });
};