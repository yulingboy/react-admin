import { request } from '@/utils/http/request';
import { Budget, BudgetQueryParams } from '@/modules/finance/types';

const baseUrl = '/api/finance/budgets';

/**
 * 获取预算列表
 * @param params 查询参数
 * @returns 预算列表和总数
 */
export const getBudgetList = (params: BudgetQueryParams) => {
  return request.get<{ items: Budget[]; total: number }>(baseUrl, { params });
};

/**
 * 获取预算详情
 * @param id 预算ID
 * @returns 预算详情
 */
export const getBudgetDetail = (id: number) => {
  return request.get<Budget>(`${baseUrl}/${id}`);
};

/**
 * 创建预算
 * @param data 预算数据
 * @returns 创建的预算信息
 */
export const createBudget = (data: Partial<Budget>) => {
  return request.post<Budget>(baseUrl, data);
};

/**
 * 更新预算
 * @param id 预算ID
 * @param data 预算数据
 * @returns 更新后的预算信息
 */
export const updateBudget = (id: number, data: Partial<Budget>) => {
  return request.put<Budget>(`${baseUrl}/${id}`, data);
};

/**
 * 删除预算
 * @param id 预算ID
 */
export const deleteBudget = (id: number) => {
  return request.delete(`${baseUrl}/${id}`);
};