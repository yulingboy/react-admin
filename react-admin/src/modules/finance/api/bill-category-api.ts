/**
 * 账单分类相关API
 */
import request from '@/utils/http';
import { 
  BillCategory, 
  BillCategoryFormData, 
  BillCategoryQueryParams, 
  BillCategoryListResult 
} from '../types';

/**
 * 分页获取账单分类列表
 * @param params 查询参数
 */
export const getBillCategoryList = (params: BillCategoryQueryParams) => {
  return request.get<BillCategoryListResult>('/api/finance/bill-categories/list', { params });
};

/**
 * 获取账单分类详情
 * @param id 账单分类ID
 */
export const getBillCategoryDetail = (id: number) => {
  return request.get<BillCategory>('/api/finance/bill-categories/detail', { params: { id } });
};

/**
 * 获取账单分类树形结构
 * @param type 分类类型(income: 收入, expense: 支出)
 */
export const getBillCategoryTree = (type: string) => {
  return request.get<BillCategory[]>('/api/finance/bill-categories/tree', { params: { type } });
};

/**
 * 获取所有账单分类选项
 * @param type 分类类型(income: 收入, expense: 支出)，不传则返回全部
 */
export const getBillCategoryOptions = (type?: string) => {
  return request.get<BillCategory[]>('/api/finance/bill-categories/options', { params: type ? { type } : undefined });
};

/**
 * 创建账单分类
 * @param data 账单分类数据
 */
export const createBillCategory = (data: BillCategoryFormData) => {
  return request.post<BillCategory>('/api/finance/bill-categories/add', data);
};

/**
 * 更新账单分类
 * @param data 账单分类数据
 */
export const updateBillCategory = (data: BillCategoryFormData) => {
  return request.put<BillCategory>('/api/finance/bill-categories/update', data);
};

/**
 * 删除账单分类
 * @param id 账单分类ID
 */
export const deleteBillCategory = (id: number) => {
  return request.delete('/api/finance/bill-categories/delete', { params: { id } });
};

/**
 * 批量删除账单分类
 * @param ids 账单分类ID数组
 */
export const batchDeleteBillCategories = (ids: number[]) => {
  return request.delete('/api/finance/bill-categories/deleteBatch', { data: { ids } });
};