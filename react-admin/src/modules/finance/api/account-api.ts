/**
 * 账户相关API
 */
import request from '@/utils/http';
import { 
  Account, 
  AccountFormData, 
  AccountQueryParams, 
  AccountListResult,
  AdjustBalanceData
} from '../types';

/**
 * 分页获取账户列表
 * @param params 查询参数
 */
export const getAccountList = (params: AccountQueryParams) => {
  return request.get<AccountListResult>('/api/finance/accounts/list', { params });
};

/**
 * 获取账户详情
 * @param id 账户ID
 */
export const getAccountDetail = (id: number) => {
  return request.get<Account>('/api/finance/accounts/detail', { params: { id } });
};

/**
 * 获取所有账户选项
 */
export const getAccountOptions = () => {
  return request.get<Account[]>('/api/finance/accounts/options');
};

/**
 * 创建账户
 * @param data 账户数据
 */
export const createAccount = (data: AccountFormData) => {
  return request.post<Account>('/api/finance/accounts/add', data);
};

/**
 * 更新账户
 * @param data 账户数据
 */
export const updateAccount = (data: AccountFormData) => {
  return request.put<Account>('/api/finance/accounts/update', data);
};

/**
 * 调整账户余额
 * @param data 调整余额数据
 */
export const adjustAccountBalance = (data: AdjustBalanceData) => {
  return request.put('/api/finance/accounts/adjustBalance', data);
};

/**
 * 删除账户
 * @param id 账户ID
 */
export const deleteAccount = (id: number) => {
  return request.delete('/api/finance/accounts/delete', { params: { id } });
};

/**
 * 批量删除账户
 * @param ids 账户ID数组
 */
export const batchDeleteAccounts = (ids: number[]) => {
  return request.delete('/api/finance/accounts/deleteBatch', { data: { ids } });
};