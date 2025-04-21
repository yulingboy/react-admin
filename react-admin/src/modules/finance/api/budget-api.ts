/**
 * 预算相关API
 */
import request from '@/utils/http';
import { 
  Budget, 
  BudgetFormData, 
  BudgetQueryParams, 
  BudgetListResult 
} from '../types';

/**
 * 分页获取预算列表
 * @param params 查询参数
 */
export const getBudgetList = (params: BudgetQueryParams) => {
  return request.get<BudgetListResult>('/api/finance/budgets/list', { params });
};

/**
 * 获取预算详情
 * @param id 预算ID
 */
export const getBudgetDetail = (id: number) => {
  return request.get<Budget>('/api/finance/budgets/detail', { params: { id } });
};

/**
 * 获取当前生效的预算
 */
export const getActiveBudgets = () => {
  return request.get<Budget[]>('/api/finance/budgets/active');
};

/**
 * 创建预算
 * @param data 预算数据
 */
export const createBudget = (data: BudgetFormData) => {
  return request.post<Budget>('/api/finance/budgets/add', data);
};

/**
 * 更新预算
 * @param data 预算数据
 */
export const updateBudget = (data: BudgetFormData) => {
  return request.put<Budget>('/api/finance/budgets/update', data);
};

/**
 * 删除预算
 * @param id 预算ID
 */
export const deleteBudget = (id: number) => {
  return request.delete('/api/finance/budgets/delete', { params: { id } });
};

/**
 * 批量删除预算
 * @param ids 预算ID数组
 */
export const batchDeleteBudgets = (ids: number[]) => {
  return request.delete('/api/finance/budgets/deleteBatch', { data: { ids } });
};