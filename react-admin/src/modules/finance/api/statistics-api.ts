/**
 * 账单统计相关API
 */
import request from '@/utils/http';
import { BillStatistics } from '../types';

/**
 * 获取账单统计数据
 * @param params 查询参数
 */
export const getBillStatistics = (params: {
  startDate?: string;
  endDate?: string;
  accountId?: number;
  type?: string;
}) => {
  return request.get<BillStatistics>('/api/finance/statistics/bills', { params });
};

/**
 * 获取收支趋势
 * @param params 查询参数
 */
export const getExpenseIncomeTrend = (params: {
  period: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}) => {
  return request.get<{ date: string; income: number; expense: number }[]>('/api/finance/statistics/trend', { params });
};

/**
 * 获取分类统计
 * @param params 查询参数
 */
export const getCategoryStatistics = (params: {
  type: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
}) => {
  return request.get<{ categoryId: number; categoryName: string; amount: number; percentage: number }[]>(
    '/api/finance/statistics/categories',
    { params }
  );
};

/**
 * 获取账户统计
 * @param params 查询参数
 */
export const getAccountStatistics = (params: {
  startDate?: string;
  endDate?: string;
}) => {
  return request.get<{ accountId: number; accountName: string; income: number; expense: number; balance: number }[]>(
    '/api/finance/statistics/accounts',
    { params }
  );
};

/**
 * 获取标签统计
 * @param params 查询参数
 */
export const getTagStatistics = (params: {
  startDate?: string;
  endDate?: string;
}) => {
  return request.get<{ tagId: number; tagName: string; amount: number; count: number }[]>(
    '/api/finance/statistics/tags',
    { params }
  );
};